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
  // полное имя теста -> пути к файлам, по одному на каждую запись в отчете.
  // путь может быть null, поэтому тип допускает null: раньше такие записи просто пропускались,
  // но тогда тест без файла не попадал бы в список сопоставленных и ФТ считалось бы непокрытым
  const names = new Map<string, (string | null)[]>();

  // имена, для которых нашлось ФТ. раньше вместо этого использованные имена удалялись из names,
  // но теперь names нужен до самого конца: из него берется список сопоставленных тестов
  const usedNames = new Set<string>();

  const state = new Map<string, AutomationState>();

  // формируем список ключей тест-кейсов из отчета testplane
  for (let { suitePath, file: path, status } of Object.values(report)) {
    const name = getFullName(...suitePath);
    const pathes = names.get(name) || [];
    pathes.push(path);
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

        // один и тот же тест попадает в отчет по разу на каждый браузер: записи отличаются
        // полем browserId, но suitePath и файл у них общие. Set схлопывает такие записи,
        // иначе прогон в трех браузерах валидатор принял бы за три разных теста и счел дубликатом.
        // цена схлопывания — два теста с одинаковым suitePath в одном файле сольются в один
        for (const path of new Set(names.get(fullName) ?? [])) {
          // null заменяем на пустую строку: в модели путь обязателен, а в отчете его может не быть
          assertion.matchedTests.push({ source: 'testplane', name: fullName, filePath: path ?? '' });
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
    // записи без файла пропускаем: показать в отчете нечего, указать на тест не получится
    pathes.forEach((path) => path && validationContext.registerTestplaneUnusedTests(name, path));
  });
};

export const loadTestplaneReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, testplaneReportDecoder);

  return entity;
};
