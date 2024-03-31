import { AssertionContext, ProjectData, getAttributesContext, getKey } from '../domain';
import { AutomationState } from '../domain/models';
import { parseObject, readTextFile } from '../utils';
import { Validator } from '../validators';
import { JestReport, jestReportDecoder } from './models';

export const getFullName = (...parts: string[]) => parts.join(' / ');

export const applyJestReport = (
  validationContext: Validator,
  { features, attributes }: ProjectData,
  report: JestReport,
  keyParts: string[],
) => {
  const names = new Map<string, string[]>();

  const state = new Map<string, AutomationState>();

  // формируем список ключей тест-кейсов из отчета jest
  for (let { assertionResults, name: path } of report.testResults) {
    for (let { title, ancestorTitles, status } of assertionResults) {
      const name = getFullName(...ancestorTitles, title);
      const pathes = names.get(name) || [];
      pathes.push(path);
      names.set(name, pathes);

      switch (status) {
        case 'passed':
        case 'failed':
          state.set(name, 'Automated');
          break;
        case 'pending':
        case 'skipped':
          state.set(name, 'Problem');
          break;
      }
    }
  }

  const attributesCtx = getAttributesContext(attributes);

  // заполняем поле isAutomated
  for (let { title: featureTitle, code: featureCode, groups, fileName, filePath, attributes = {} } of features) {
    for (let { title: groupTitle, assertions } of groups || []) {
      for (let assertion of assertions || []) {
        // TODO: перенести в domain?
        const assertionCtx: AssertionContext = {
          featureTitle,
          featureCode,
          groupTitle,
          assertionTitle: assertion.title,
          attributes,
          fileName,
          filePath,
        };

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
    pathes?.forEach((path) => validationContext.registerJestUnusedTests(name, path));
  });
};

export const loadJestReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, jestReportDecoder);

  return entity;
};
