import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { jestConfigDecoder } from '../src/lib/config/models';
import { applyJestReport, loadJestReport } from '../src/lib/jest';
import { JestReport } from '../src/lib/jest/models';
import { Validator } from '../src/lib/validators';
import { assertionOf, buildJestReport, buildModel, readReport } from './helpers';

const directories: string[] = [];
const keys = ['featureTitle', 'groupTitle', 'assertionTitle'];

const directory = async () => {
  const path = await mkdtemp(join(tmpdir(), 'spec-box-jest-'));
  directories.push(path);
  return path;
};

const saveReport = async (base: string, name: string, report: JestReport) => {
  const path = join(base, name);
  await writeFile(path, JSON.stringify(report));
  return path;
};

const reportOf = (file: string, title: string, startTime = 0) => ({
  ...buildJestReport([{ file, tests: [{ ancestors: ['Ф', 'Г'], title }] }]),
  startTime,
});

afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe('Конфигурация нескольких Jest/Vitest отчетов', () => {
  it.each(['report.json', ['report.json'], ['second.json', 'first.json']].map((reportPath) => ({ reportPath })))(
    'принимает строку или непустой массив: $reportPath',
    ({ reportPath }) => {
      expect(jestConfigDecoder.decode({ reportPath, keys })).toEqual({
        _tag: 'Right',
        right: { reportPath, keys },
      });
    },
  );

  it.each([[], null, ['report.json', 42], ['report.json', null], 42].map((reportPath) => ({ reportPath })))(
    'отклоняет неверный reportPath: $reportPath',
    ({ reportPath }) => {
      expect(jestConfigDecoder.decode({ reportPath, keys })._tag).toBe('Left');
    },
  );
});

describe('Загрузка нескольких Jest/Vitest отчетов', () => {
  it('строка и одноэлементный массив возвращают исходный отчет', async () => {
    const base = await directory();
    const report = reportOf('one.test.ts', 'Первый', 30);
    const path = await saveReport(base, 'one.json', report);

    expect(await loadJestReport(path)).toEqual(report);
    expect(await loadJestReport([path])).toEqual(report);
  });

  it('читает все отчеты, суммирует счетчик, берет минимальное время и сохраняет порядок конфигурации', async () => {
    const base = await directory();
    const first = reportOf('first.test.ts', 'Первый', 90);
    const second = reportOf('second.test.ts', 'Второй', 10);
    const third = reportOf('third.test.ts', 'Третий', 40);
    // Счетчик отчета суммируется как есть, а не вычисляется из assertionResults.
    first.numTotalTests = 7;
    const paths = await Promise.all([
      saveReport(base, 'first.json', first),
      saveReport(base, 'second.json', second),
      saveReport(base, 'third.json', third),
    ]);

    expect(await loadJestReport(paths)).toEqual({
      startTime: 10,
      numTotalTests: 9,
      testResults: [...first.testResults, ...second.testResults, ...third.testResults],
    });
  });

  it('принимает пустой отчет отдельно и вместе с непустым', async () => {
    const base = await directory();
    const empty = { ...buildJestReport([]), startTime: 5 };
    const full = reportOf('full.test.ts', 'Тест', 20);
    const emptyPath = await saveReport(base, 'empty.json', empty);
    const fullPath = await saveReport(base, 'full.json', full);

    expect(await loadJestReport(emptyPath)).toEqual(empty);
    expect(await loadJestReport([fullPath, emptyPath])).toEqual({ ...full, startTime: 5 });
  });

  it('отклоняет пустой массив при прямом вызове', async () => {
    await expect(loadJestReport([])).rejects.toThrow();
  });

  it('разрешает относительные пути через basePath, не меняя абсолютные', async () => {
    const base = await directory();
    const elsewhere = await directory();
    const first = reportOf('relative.test.ts', 'Относительный', 20);
    const second = reportOf('absolute.test.ts', 'Абсолютный', 10);
    await saveReport(base, 'relative.json', first);
    const absolute = await saveReport(elsewhere, 'absolute.json', second);

    expect(await loadJestReport('relative.json', base)).toEqual(first);
    expect(await loadJestReport(['relative.json', absolute], base)).toEqual({
      startTime: 10,
      numTotalTests: 2,
      testResults: [...first.testResults, ...second.testResults],
    });
  });

  it('сохраняет повторные входные пути без дедупликации', async () => {
    const base = await directory();
    const report = reportOf('same.test.ts', 'Повтор', 10);
    const path = await saveReport(base, 'same.json', report);

    expect(await loadJestReport([path, path])).toEqual({
      ...report,
      numTotalTests: 2,
      testResults: [...report.testResults, ...report.testResults],
    });
  });

  it.each(['missing', 'json', 'schema'] as const)(
    'ошибка %s во втором файле содержит источник, путь и причину, а не возвращает частичный отчет',
    async (kind) => {
      const base = await directory();
      const valid = await saveReport(base, 'valid.json', reportOf('valid.test.ts', 'Тест'));
      const broken = join(base, `${kind}.json`);
      let reason = 'ENOENT';
      if (kind === 'json') {
        const text = '{ invalid JSON';
        await writeFile(broken, text);
        try {
          JSON.parse(text);
        } catch (error) {
          reason = (error as Error).message;
        }
      } else if (kind === 'schema') {
        await writeFile(broken, JSON.stringify({ ...buildJestReport([]), startTime: 'wrong' }));
        reason = 'startTime';
      }

      await expect(loadJestReport([valid, broken])).rejects.toThrow('Jest/Vitest');
      await expect(loadJestReport([valid, broken])).rejects.toThrow(broken);
      await expect(loadJestReport([valid, broken])).rejects.toThrow(reason);
    },
  );

  it('применяет merged reports: сохраняет сопоставления, unused и обнаруживает дубликаты между отчетами', async () => {
    const base = await directory();
    const first = reportOf('first.test.ts', 'Общий');
    const second = buildJestReport([
      {
        file: 'second.test.ts',
        tests: [
          { ancestors: ['Ф', 'Г'], title: 'Общий' },
          { ancestors: ['Ф', 'Г'], title: 'Другой', status: 'skipped' },
          { ancestors: ['Ф', 'Г'], title: 'Лишний' },
        ],
      },
    ]);
    const paths = await Promise.all([saveReport(base, 'one.json', first), saveReport(base, 'two.json', second)]);
    const model = buildModel([{ title: 'Ф', groups: { Г: ['Общий', 'Другой'] } }]);
    const validator = new Validator({});

    applyJestReport(validator, model, await loadJestReport(paths), keys);
    validator.validateTests(model);

    expect(assertionOf(model, 'Общий').matchedTests).toEqual([
      { source: 'jest', name: 'Ф / Г / Общий', filePath: 'first.test.ts' },
      { source: 'jest', name: 'Ф / Г / Общий', filePath: 'second.test.ts' },
    ]);
    expect(assertionOf(model, 'Общий').automationState).toBe('Automated');
    expect(assertionOf(model, 'Другой').matchedTests).toEqual([
      { source: 'jest', name: 'Ф / Г / Другой', filePath: 'second.test.ts' },
    ]);
    expect(assertionOf(model, 'Другой').automationState).toBe('Problem');
    const entries = readReport(validator).entries;
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      severity: 'WARN',
      message: 'Обнаружен тест без описания',
      details: ['Ф / Г / Лишний'],
      filePath: 'second.test.ts',
    });
    expect(entries[1].message).toContain('Утверждение проверяется несколькими тестами');
    expect(entries[1].details.join('\n')).toContain('first.test.ts');
    expect(entries[1].details.join('\n')).toContain('second.test.ts');
  });
});
