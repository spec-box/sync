import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
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
  // полное имя теста -> пути к файлам, в которых встретился тест с таким именем.
  // одно имя может встретиться несколько раз: это и есть дубликаты, которые ищет валидатор
  const names = new Map<string, string[]>();

  // имена, для которых нашлось ФТ. раньше вместо этого использованные имена удалялись из names,
  // но теперь names нужен до самого конца: из него берется список сопоставленных тестов
  const usedNames = new Set<string>();

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

        // складываем в модель все тесты с таким именем — по одному на каждое вхождение в отчет.
        // если вхождений больше одного, валидатор сообщит о дубликате;
        // если ни одного, ФТ останется без сопоставленных тестов и попадет в непокрытые
        for (const path of names.get(fullName) ?? []) {
          assertion.matchedTests.push({ source: 'jest', name: fullName, filePath: path });
        }

        // помечаем имя использованным, даже если теста с таким именем в отчете не было:
        // для отчета о тестах без описания важно только обратное — какие имена остались лишними
        usedNames.add(fullName);
      }
    }
  }

  // все, что не совпало ни с одним ФТ, — тесты без описания
  names.forEach((pathes, name) => {
    if (usedNames.has(name)) {
      return;
    }
    // дубликаты сообщаются по отдельности: у каждого вхождения свой файл, и найти нужно каждый
    pathes.forEach((path) => validationContext.registerJestUnusedTests(name, path));
  });
};

export const loadJestReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, jestReportDecoder);

  return entity;
};
