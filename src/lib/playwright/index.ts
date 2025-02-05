import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
import { AutomationState } from '../domain/models';
import { parseObject, readTextFile } from '../utils';
import { Validator } from '../validators';
import { PlaywrightReport, playwrightReportDecoder } from './models';

export const getFullName = (...parts: string[]) => parts.join(' / ');

export const applyPlaywrightReport = (
  validationContext: Validator,
  { features, attributes }: ProjectData,
  report: PlaywrightReport,
  keyParts: string[],
) => {
  const names = new Map<string, string[]>();

  const state = new Map<string, AutomationState>();

  const calcReverse = (prevSuites: PlaywrightReport['suites'], paths: string[]) => {
    for (let { file: path, suites, specs, title } of prevSuites) {
      if (suites) {
        calcReverse(suites, [...paths, title]);
      }

      if (!specs.length) {
        continue;
      }

      for (let { tests, title: testTitle } of specs) {
        // На первом уровне playwrite-report в title название файла,
        // которого не должно быть в названии теста.
        // Поэтому име генерируем со второго элемента
        const name = getFullName(...paths.slice(1), title, testTitle);

        // Добавление в мапу для ошибки тестов без описания
        const pathes = names.get(name) || [];
        if (path) {
          pathes.push(path);
        }
        names.set(name, pathes);

        const automated = tests.find(({ expectedStatus }) => ['passed'].includes(expectedStatus));

        console.log('name: ', name);
        if (automated) {
          state.set(name, 'Automated');
        } else {
          state.set(name, 'Problem');
        }
      }
    }
  };

  calcReverse(report.suites, []);

  const attributesCtx = getAttributesContext(attributes);

  // заполняем поле isAutomated
  for (let feature of features) {
    for (let group of feature.groups || []) {
      for (let assertion of group.assertions || []) {
        const assertionCtx = getAssertionContext(feature, group, assertion);

        const parts = getKey(keyParts, assertionCtx, attributesCtx);
        const fullName = getFullName(...parts);

        const automationState = state.get(fullName);
        if (automationState) {
          assertion.automationState = automationState;
        }

        names.delete(fullName);
      }
    }
  }
  Array.from(names.keys()).forEach((name) => {
    const pathes = names.get(name);
    pathes?.forEach((path) => validationContext.registerPlaywrightUnusedTests(name, path));
  });
};

export const loadPlaywrightReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, playwrightReportDecoder);

  return entity;
};
