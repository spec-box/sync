import { Assertion, Attribute, ProjectData } from '../src/lib/domain';
import { JestReport } from '../src/lib/jest/models';
import { PlaywrightReport, PlaywrightTestStatus, TestSuite } from '../src/lib/playwright/models';
import { StorybookIndex } from '../src/lib/storybook/models';
import { TestplaneReport, TestplaneTestStatus } from '../src/lib/testplane/models';
import { Validator } from '../src/lib/validators';

// модель

export interface FeatureInput {
  title: string;
  code?: string;
  filePath?: string;
  attributes?: Record<string, string[]>;
  groups: Record<string, string[]>;
}

export const buildModel = (features: FeatureInput[], attributes?: Attribute[]): ProjectData => ({
  features: features.map((feature, index) => ({
    code: feature.code ?? `feature-${index + 1}`,
    title: feature.title,
    fileName: `feature-${index + 1}`,
    filePath: feature.filePath ?? `specs/feature-${index + 1}.yml`,
    attributes: feature.attributes,
    groups: Object.entries(feature.groups).map(([title, assertions]) => ({
      title,
      assertions: assertions.map((assertionTitle) => ({
        title: assertionTitle,
        automationState: 'Unknown' as const,
        matchedTests: [],
      })),
    })),
  })),
  attributes,
  metaFilePath: '.spec-box-meta.yml',
});

export const assertionOf = (data: ProjectData, title: string): Assertion => {
  for (const feature of data.features) {
    for (const group of feature.groups) {
      for (const assertion of group.assertions) {
        if (assertion.title === title) {
          return assertion;
        }
      }
    }
  }

  throw new Error(`утверждение не найдено: ${title}`);
};

export const allAssertions = (data: ProjectData): Assertion[] =>
  data.features.flatMap((feature) => feature.groups.flatMap((group) => group.assertions));

// отчет валидации

export interface ReportEntry {
  severity: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  details: string[];
  filePath: string;
}

export interface Report {
  entries: ReportEntry[];
  summary: string;
}

const ANSI = /\x1B\[[0-9;]*m/g;
const SEVERITY = /^\s*(ERROR|WARN|INFO)\s+(.*)$/;

// printReport печатает каждую ошибку одним вызовом console.log, поэтому перехваченный блок —
// это одна запись отчета: уровень и первая строка сообщения, затем детали, затем путь к файлу.
// разбираем блок на поля, чтобы тесты сравнивали отчет целиком, а не искали в нем подстроки
export const readReport = (validator: Validator): Report => {
  const blocks: string[] = [];
  const original = console.log;

  console.log = (...args: unknown[]) => {
    blocks.push(
      args
        .map((arg) => String(arg))
        .join(' ')
        .replace(ANSI, ''),
    );
  };

  try {
    validator.printReport();
  } finally {
    console.log = original;
  }

  const entries: ReportEntry[] = [];
  let summary = '';

  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line !== '');
    const head = lines[0]?.match(SEVERITY);

    // блок без уровня — итоговая строка со счетчиками
    if (!head) {
      summary = block.trim();
      continue;
    }

    entries.push({
      severity: head[1] as ReportEntry['severity'],
      message: head[2].trim(),
      details: lines.slice(1, -1).map((line) => line.trim()),
      filePath: lines[lines.length - 1].trim(),
    });
  }

  return { entries, summary };
};

// отчеты источников

export interface JestTestInput {
  ancestors?: string[];
  title: string;
  status?: JestReport['testResults'][number]['assertionResults'][number]['status'];
}

export const buildJestReport = (files: { file: string; tests: JestTestInput[] }[]): JestReport => ({
  startTime: 0,
  numTotalTests: files.reduce((count, { tests }) => count + tests.length, 0),
  testResults: files.map(({ file, tests }) => ({
    name: file,
    status: 'passed' as const,
    message: '',
    startTime: 0,
    endTime: 1,
    assertionResults: tests.map(({ ancestors = [], title, status = 'passed' }) => ({
      title,
      fullName: [...ancestors, title].join(' '),
      ancestorTitles: ancestors,
      status,
    })),
  })),
});

export interface StoryInput {
  title: string;
  name: string;
  id?: string;
  importPath?: string;
}

export const buildStorybookIndex = (stories: StoryInput[]): StorybookIndex => ({
  v: 4,
  entries: Object.fromEntries(
    stories.map((story, index) => {
      const id = story.id ?? `story-${index + 1}`;

      return [
        id,
        {
          type: 'story' as const,
          id,
          name: story.name,
          title: story.title,
          importPath: story.importPath ?? `./src/Story${index + 1}.stories.tsx`,
        },
      ];
    }),
  ),
});

export interface TestplaneTestInput {
  suitePath: string[];
  file?: string | null;
  browserId?: string;
  status?: TestplaneTestStatus;
}

export const buildTestplaneReport = (tests: TestplaneTestInput[]): TestplaneReport =>
  Object.fromEntries(
    tests.map((test, index) => [
      `test-${index + 1}`,
      {
        suitePath: test.suitePath,
        fullName: test.suitePath.join(' '),
        browserId: test.browserId ?? 'chrome',
        file: test.file === undefined ? 'tests/suite.testplane.ts' : test.file,
        duration: 1,
        meta: {},
        startTime: 0,
        status: test.status ?? 'success',
      },
    ]),
  );

export interface PlaywrightTestInput {
  file: string;
  suites?: string[];
  title: string;
  expectedStatus?: PlaywrightTestStatus;
}

const addSuite = (siblings: TestSuite[], title: string, file: string): TestSuite => {
  const suite: TestSuite = { title, file, specs: [] };
  siblings.push(suite);

  return suite;
};

export const buildPlaywrightReport = (tests: PlaywrightTestInput[]): PlaywrightReport => {
  const roots: TestSuite[] = [];

  for (const { file, suites = [], title, expectedStatus = 'passed' } of tests) {
    // suite верхнего уровня соответствует файлу, его название в полное имя теста не попадает
    let node: TestSuite = roots.find((suite) => suite.title === file) ?? addSuite(roots, file, file);

    for (const suiteTitle of suites) {
      const children: TestSuite[] = (node.suites = node.suites ?? []);

      node = children.find((suite) => suite.title === suiteTitle) ?? addSuite(children, suiteTitle, file);
    }

    node.specs.push({ title, tests: [{ expectedStatus, results: [{ status: expectedStatus }] }] });
  }

  return {
    suites: roots,
    stats: { startTime: '2024-01-01T00:00:00.000Z', duration: 1, expected: 1, skipped: 0, unexpected: 0, flaky: 0 },
  };
};
