import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpecBoxWebApiModelUploadData, SpecBoxWebApiModelStatAutotestsStatUploadData } from '../src/api';
import { cmdSync } from '../src/commands/sync';
import { cmdUploadStat } from '../src/commands/upload-stat';
import { cmdValidateOnly } from '../src/commands/validate-only';
import { buildJestReport } from './helpers';

const api = vi.hoisted(() => ({
  exportUpload: vi.fn<(request: { project: string; body: SpecBoxWebApiModelUploadData }) => Promise<void>>(),
  statUploadAutotests:
    vi.fn<(request: { project: string; body: SpecBoxWebApiModelStatAutotestsStatUploadData }) => Promise<void>>(),
}));

vi.mock('../src/api', () => ({
  SpecBoxWebApi: vi.fn(function () {
    return api;
  }),
}));

const commands = [
  { name: 'validate', command: cmdValidateOnly },
  { name: 'sync', command: cmdSync },
  { name: 'upload-stat', command: cmdUploadStat },
];
const reportNames = ['client-unit', 'client-bff', 'server-bff'];
const starts = [3000, 1000, 2000];
const durations = [0.6, 1.6, 2.6];
const roots: string[] = [];

// The config deliberately lives outside projectPath. Reports and YAML must be
// resolved against the real project directory, not cwd or the config directory.
async function fixture(mode: 'string' | 'array' | 'empty' = 'array') {
  const root = await mkdtemp(join(tmpdir(), 'spec-box-jest-commands-'));
  roots.push(root);
  const projectPath = join(root, 'project');
  await mkdir(join(projectPath, 'reports'), { recursive: true });
  await mkdir(join(projectPath, 'specs'));
  const selected = mode === 'string' ? reportNames.slice(0, 1) : reportNames;
  const paths: string[] = [];

  for (const [index, name] of selected.entries()) {
    const titles = Array.from({ length: index + 1 }, (_, n) => `${name}-assertion-${n + 1}`);
    const report = buildJestReport([
      // Identical suite names across reports must not cause deduplication.
      { file: 'shared.test.ts', tests: titles.map((title) => ({ title })) },
    ]);
    report.startTime = starts[index];
    report.testResults[0].startTime = 0;
    report.testResults[0].endTime = durations[index];
    const path = `reports/${name}.json`;
    paths.push(path);
    await writeFile(join(projectPath, path), JSON.stringify(report));
    await writeFile(
      join(projectPath, 'specs', `${name}.yml`),
      [
        `code: ${name}`,
        `feature: ${name}`,
        'specs-unit:',
        '  Checks:',
        ...titles.map((title) => `    - assert: ${title}`),
      ].join('\n'),
    );
  }

  const config = join(root, 'config.json');
  await writeFile(
    config,
    JSON.stringify({
      projectPath,
      api: { host: 'https://spec-box.invalid', project: 'jest-regression' },
      yml: { files: ['specs/*.yml'] },
      jest: { reportPath: mode === 'empty' ? [] : mode === 'string' ? paths[0] : paths, keys: ['assertionTitle'] },
      validation: { 'assertion-not-covered': 'error' },
    }),
  );
  return { config, projectPath, paths, selected };
}

function expectNoApiCalls() {
  expect(api.exportUpload).not.toHaveBeenCalled();
  expect(api.statUploadAutotests).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  api.exportUpload.mockResolvedValue(undefined);
  api.statUploadAutotests.mockResolvedValue(undefined);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe.each(commands)('$name: реальные Jest-файлы', ({ name, command }) => {
  it.each(['array', 'string'] as const)('обрабатывает reportPath=%s целиком', async (mode) => {
    const { config, selected } = await fixture(mode);
    await expect(command.handler({ config, $0: name, _: [] })).resolves.toBeUndefined();

    if (name === 'validate') {
      // With assertion-not-covered:error, success proves every unique assertion
      // from every report matched its YAML assertion.
      expectNoApiCalls();
    } else if (name === 'sync') {
      expect(api.exportUpload).toHaveBeenCalledTimes(1);
      expect(api.statUploadAutotests).not.toHaveBeenCalled();
      const request = api.exportUpload.mock.calls[0][0];
      expect(request.project).toBe('jest-regression');
      expect(request.body.features).toHaveLength(selected.length);
      for (const [index, code] of selected.entries()) {
        const feature = request.body.features?.find((feature) => feature.code === code);
        expect(feature?.groups).toEqual([
          {
            title: 'Checks',
            assertions: Array.from({ length: index + 1 }, (_, n) => ({
              title: `${code}-assertion-${n + 1}`,
              automationState: 'Automated',
            })),
          },
        ]);
      }
    } else {
      expect(api.exportUpload).not.toHaveBeenCalled();
      expect(api.statUploadAutotests).toHaveBeenCalledTimes(1);
      expect(api.statUploadAutotests).toHaveBeenCalledWith({
        project: 'jest-regression',
        body: {
          timestamp: new Date(mode === 'array' ? 1000 : 3000),
          assertionsCount: mode === 'array' ? 6 : 1,
          // floor(sum) = 4, whereas sum(floor) = 3.
          duration: mode === 'array' ? 4 : 0,
        },
      });
    }
  });

  it.each(['missing', 'bad JSON', 'invalid schema'] as const)(
    'отклоняет %s во втором отчете до любых API-вызовов',
    async (failure) => {
      const { config, projectPath, paths } = await fixture();
      const brokenPath = paths[1];
      const absolutePath = join(projectPath, brokenPath);
      if (failure === 'missing') {
        await rm(absolutePath);
      } else {
        await writeFile(absolutePath, failure === 'bad JSON' ? '{ broken JSON' : JSON.stringify({ startTime: 'bad' }));
      }

      const result = command.handler({ config, $0: name, _: [] });
      await expect(result).rejects.toThrow('Jest/Vitest');
      await expect(result).rejects.toThrow(brokenPath);
      expectNoApiCalls();
    },
  );

  it('отклоняет пустой массив reportPath до любых API-вызовов', async () => {
    const { config } = await fixture('empty');
    await expect(command.handler({ config, $0: name, _: [] })).rejects.toThrow();
    expectNoApiCalls();
  });
});
