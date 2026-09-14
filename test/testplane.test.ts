import { describe, expect, it } from 'vitest';

import { applyTestplaneReport } from '../src/lib/testplane';
import { Validator } from '../src/lib/validators';
import { allAssertions, assertionOf, buildModel, buildTestplaneReport, readReport } from './helpers';

const KEYS = ['featureTitle', 'groupTitle', 'assertionTitle'];

describe('Поддержка testplane', () => {
  describe('Идентификатор ФТ', () => {
    it('Идентификатор ФТ собирается из перечисленных в keys сегментов, в указанном порядке', () => {
      const report = buildTestplaneReport([
        { suitePath: ['Главная страница', 'Блок корзины', 'Отображается корзина'], file: 'tests/cart.ts' },
      ]);

      const matching = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyTestplaneReport(new Validator({}), matching, report, ['featureTitle', 'groupTitle', 'assertionTitle']);

      expect(assertionOf(matching, 'Отображается корзина').matchedTests).toEqual([
        {
          source: 'testplane',
          name: 'Главная страница / Блок корзины / Отображается корзина',
          filePath: 'tests/cart.ts',
        },
      ]);

      // тот же отчет, обратный порядок сегментов — идентификатор другой, совпадения нет
      const reversed = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyTestplaneReport(new Validator({}), reversed, report, ['assertionTitle', 'groupTitle', 'featureTitle']);

      expect(assertionOf(reversed, 'Отображается корзина').matchedTests).toEqual([]);
    });

    it('Для сегмента, заданного через символ собаки, подставляется код значения атрибута фичи', () => {
      // мета-информация не нужна: подставляется код значения, а не его название
      const model = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      const report = buildTestplaneReport([{ suitePath: ['cart', 'Утверждение'], file: 'tests/cart.ts' }]);

      applyTestplaneReport(new Validator({}), model, report, ['@component', 'assertionTitle']);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'cart / Утверждение', filePath: 'tests/cart.ts' },
      ]);
    });

    it('Для сегмента, заданного через символ доллара, подставляется название значения атрибута фичи', () => {
      const model = buildModel(
        [{ title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } }],
        [{ code: 'component', title: 'Компонент', values: [{ code: 'cart', title: 'Корзина' }] }],
      );
      const report = buildTestplaneReport([{ suitePath: ['Корзина', 'Утверждение'], file: 'tests/cart.ts' }]);

      applyTestplaneReport(new Validator({}), model, report, ['$component', 'assertionTitle']);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'Корзина / Утверждение', filePath: 'tests/cart.ts' },
      ]);
    });

    it('Если у фичи несколько значений атрибута, указанного в keys, тест с ней не сопоставляется', () => {
      const report = buildTestplaneReport([{ suitePath: ['cart', 'Утверждение'], file: 'tests/cart.ts' }]);

      // контроль: с одним значением атрибута тот же тест сопоставляется
      const single = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyTestplaneReport(new Validator({}), single, report, ['@component', 'assertionTitle']);

      expect(assertionOf(single, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'cart / Утверждение', filePath: 'tests/cart.ts' },
      ]);

      const multiple = buildModel([
        { title: 'Главная', attributes: { component: ['cart', 'header'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyTestplaneReport(new Validator({}), multiple, report, ['@component', 'assertionTitle']);

      expect(assertionOf(multiple, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(multiple, 'Утверждение').automationState).toBe('Unknown');
    });

    it('Если у фичи не проставлен атрибут, указанный в keys, тест с ней не сопоставляется', () => {
      const report = buildTestplaneReport([{ suitePath: ['cart', 'Утверждение'], file: 'tests/cart.ts' }]);

      // контроль: с проставленным атрибутом тот же тест сопоставляется
      const marked = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyTestplaneReport(new Validator({}), marked, report, ['@component', 'assertionTitle']);

      expect(assertionOf(marked, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'cart / Утверждение', filePath: 'tests/cart.ts' },
      ]);

      const unmarked = buildModel([{ title: 'Главная', groups: { Группа: ['Утверждение'] } }]);
      applyTestplaneReport(new Validator({}), unmarked, report, ['@component', 'assertionTitle']);

      expect(assertionOf(unmarked, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(unmarked, 'Утверждение').automationState).toBe('Unknown');
    });
  });

  describe('Разбор отчета', () => {
    it('Полное имя теста собирается из suitePath', () => {
      const model = buildModel([{ title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } }]);
      const report = buildTestplaneReport([
        // suitePath без названия группы — полное имя короче, совпадения не будет
        { suitePath: ['Главная страница', 'Отображается корзина'], file: 'tests/flat.ts' },
        { suitePath: ['Главная страница', 'Блок корзины', 'Отображается корзина'], file: 'tests/cart.ts' },
      ]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Отображается корзина').matchedTests).toEqual([
        {
          source: 'testplane',
          name: 'Главная страница / Блок корзины / Отображается корзина',
          filePath: 'tests/cart.ts',
        },
      ]);
    });

    it('Тест со статусом success или fail делает ФТ автоматизированным', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Успешный', 'Упавший'] } }]);
      const report = buildTestplaneReport([
        { suitePath: ['Ф', 'Г', 'Успешный'], file: 'tests/cart.ts', status: 'success' },
        { suitePath: ['Ф', 'Г', 'Упавший'], file: 'tests/cart.ts', status: 'fail' },
      ]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Automated', 'Automated']);
    });

    it('Тест со статусом error или skipped помечает ФТ как проблемный', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Сломанный', 'Пропущенный'] } }]);
      const report = buildTestplaneReport([
        { suitePath: ['Ф', 'Г', 'Сломанный'], file: 'tests/cart.ts', status: 'error' },
        { suitePath: ['Ф', 'Г', 'Пропущенный'], file: 'tests/cart.ts', status: 'skipped' },
      ]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Problem', 'Problem']);
    });
  });

  describe('Сопоставленные тесты', () => {
    it('Тест, полное имя которого совпало с идентификатором ФТ, добавляется в модель как сопоставленный с этим ФТ', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildTestplaneReport([{ suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts' }]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'Ф / Г / Утверждение', filePath: 'tests/cart.ts' },
      ]);
    });

    it('Запуски одного теста в разных браузерах дают ФТ один сопоставленный тест', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildTestplaneReport([
        { suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts', browserId: 'chrome' },
        { suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts', browserId: 'firefox' },
        { suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts', browserId: 'safari' },
      ]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'Ф / Г / Утверждение', filePath: 'tests/cart.ts' },
      ]);
    });

    it('Тесты с одинаковым suitePath из разных файлов дают ФТ два сопоставленных теста', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildTestplaneReport([
        { suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts' },
        { suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/checkout.ts' },
      ]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'testplane', name: 'Ф / Г / Утверждение', filePath: 'tests/cart.ts' },
        { source: 'testplane', name: 'Ф / Г / Утверждение', filePath: 'tests/checkout.ts' },
      ]);
    });

    it('Если идентификаторы двух ФТ совпадают, тест сопоставляется с обоими', () => {
      const model = buildModel([
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
        // вторая фича с тем же названием — идентификатор ФТ получается тот же
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
      ]);
      const report = buildTestplaneReport([{ suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts' }]);

      applyTestplaneReport(new Validator({}), model, report, KEYS);

      const matched = { source: 'testplane', name: 'Ф / Г / Утверждение', filePath: 'tests/cart.ts' };
      expect(allAssertions(model).map(({ matchedTests }) => matchedTests)).toEqual([[matched], [matched]]);
      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Automated', 'Automated']);
    });

    it('Тест, не сопоставленный ни с одним ФТ, попадает в отчет как тест без описания', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildTestplaneReport([
        // контроль: сопоставленный тест в отчет не попадет, в отчете останется только лишний
        { suitePath: ['Ф', 'Г', 'Утверждение'], file: 'tests/cart.ts' },
        { suitePath: ['Ф', 'Г', 'Лишний тест'], file: 'tests/extra.ts' },
      ]);

      applyTestplaneReport(validator, model, report, KEYS);

      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружен интеграционный testplane тест без описания',
          details: ['Ф / Г / Лишний тест'],
          filePath: 'tests/extra.ts',
        },
      ]);
    });
  });
});
