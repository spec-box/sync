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
  // полное имя теста -> пути к файлам, в которых встретился тест с таким именем.
  // запуски в разных проектах playwright складывает внутрь одного spec, поэтому
  // одно имя попадает сюда по разу на файл, а не по разу на браузер
  const names = new Map<string, string[]>();

  // имена, для которых нашлось ФТ. раньше вместо этого использованные имена удалялись из names,
  // но теперь names нужен до самого конца: из него берется список сопоставленных тестов
  const usedNames = new Set<string>();

  const state = new Map<string, AutomationState>();

  const calcReverse = (prevSuites: PlaywrightReport['suites'], paths: string[]) => {
    for (let { file: path, suites, specs, title } of prevSuites) {
      if (suites) {
        calcReverse(suites, [...paths, title]);
      }

      if (!specs.length) {
        continue;
      }

      // На первом уровне playwrite-report в title название файла,
      // которого не должно быть в названии теста.
      // Поэтому име генерируем со второго элемента
      const parts = paths.concat(title).slice(1);
      for (let { tests, title: testTitle } of specs) {
        const name = getFullName(...parts, testTitle);

        // Добавление в мапу для ошибки тестов без описания
        const pathes = names.get(name) || [];
        pathes.push(path);
        names.set(name, pathes);

        const automated = tests.find(({ expectedStatus }) => expectedStatus == 'passed');

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

        // складываем в модель все тесты с таким именем — по одному на каждый файл.
        // если файлов больше одного, валидатор сообщит о дубликате;
        // если ни одного, ФТ останется без сопоставленных тестов и попадет в непокрытые
        for (const path of names.get(fullName) ?? []) {
          assertion.matchedTests.push({ source: 'playwright', name: fullName, filePath: path });
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
    pathes.forEach((path) => validationContext.registerPlaywrightUnusedTests(name, path));
  });
};

export const loadPlaywrightReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, playwrightReportDecoder);

  return entity;
};
