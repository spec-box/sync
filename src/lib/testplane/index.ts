import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
import { AutomationState } from '../domain/models';
import { parseObject, readTextFile } from '../utils';
import { Validator } from '../validators';
import { TestplaneReport, testplaneReportDecoder } from './models';

export const getFullName = (...parts: string[]) => parts.join(' / ');

export const applyTestplaneReport = (
  validationContext: Validator,
  { features, attributes }: ProjectData,
  report: TestplaneReport,
  keyParts: string[],
) => {
  const names = new Map<string, string[]>();

  const state = new Map<string, AutomationState>();

  // формируем список ключей тест-кейсов из отчета testplane
  for (let { suitePath, file: path, status } of Object.values(report)) {
    const name = getFullName(...suitePath);
    const pathes = names.get(name) || [];
    if (path) {
      pathes.push(path);
    }
    names.set(name, pathes);

    switch (status) {
      case 'success':
      case 'fail':
        state.set(name, 'Automated');
        break;
      case 'error':
      case 'skipped':
        state.set(name, 'Problem');
        break;
    }
  }

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
    pathes?.forEach((path) => validationContext.registerTestplaneUnusedTests(name, path));
  });
};

export const loadTestplaneReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, testplaneReportDecoder);

  return entity;
};
