import { describe, expect, it } from 'vitest';

import { applyPlaywrightReport } from '../src/lib/playwright';
import { Validator } from '../src/lib/validators';
import { allAssertions, assertionOf, buildModel, buildPlaywrightReport, readReport } from './helpers';

const KEYS = ['featureTitle', 'groupTitle', 'assertionTitle'];

describe('Поддержка playwright', () => {
  describe('Идентификатор ФТ', () => {
    it('Идентификатор ФТ собирается из перечисленных в keys сегментов, в указанном порядке', () => {
      const report = buildPlaywrightReport([
        { file: 'cart.spec.ts', suites: ['Главная страница', 'Блок корзины'], title: 'Отображается корзина' },
      ]);

      const matching = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyPlaywrightReport(new Validator({}), matching, report, ['featureTitle', 'groupTitle', 'assertionTitle']);

      expect(assertionOf(matching, 'Отображается корзина').matchedTests).toEqual([
        {
          source: 'playwright',
          name: 'Главная страница / Блок корзины / Отображается корзина',
          filePath: 'cart.spec.ts',
        },
      ]);

      // тот же отчет, обратный порядок сегментов — идентификатор другой, совпадения нет
      const reversed = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyPlaywrightReport(new Validator({}), reversed, report, ['assertionTitle', 'groupTitle', 'featureTitle']);

      expect(assertionOf(reversed, 'Отображается корзина').matchedTests).toEqual([]);
    });

    it('Для сегмента, заданного через символ собаки, подставляется код значения атрибута фичи', () => {
      // мета-информация не нужна: подставляется код значения, а не его название
      const model = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      const report = buildPlaywrightReport([{ file: 'cart.spec.ts', suites: ['cart'], title: 'Утверждение' }]);

      applyPlaywrightReport(new Validator({}), model, report, ['@component', 'assertionTitle']);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'playwright', name: 'cart / Утверждение', filePath: 'cart.spec.ts' },
      ]);
    });

    it('Для сегмента, заданного через символ доллара, подставляется название значения атрибута фичи', () => {
      const model = buildModel(
        [{ title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } }],
        [{ code: 'component', title: 'Компонент', values: [{ code: 'cart', title: 'Корзина' }] }],
      );
      const report = buildPlaywrightReport([{ file: 'cart.spec.ts', suites: ['Корзина'], title: 'Утверждение' }]);

      applyPlaywrightReport(new Validator({}), model, report, ['$component', 'assertionTitle']);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'playwright', name: 'Корзина / Утверждение', filePath: 'cart.spec.ts' },
      ]);
    });

    it('Если у фичи несколько значений атрибута, указанного в keys, тест с ней не сопоставляется', () => {
      const report = buildPlaywrightReport([{ file: 'cart.spec.ts', suites: ['cart'], title: 'Утверждение' }]);

      // контроль: с одним значением атрибута тот же тест сопоставляется
      const single = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyPlaywrightReport(new Validator({}), single, report, ['@component', 'assertionTitle']);

      expect(assertionOf(single, 'Утверждение').matchedTests).toEqual([
        { source: 'playwright', name: 'cart / Утверждение', filePath: 'cart.spec.ts' },
      ]);

      const multiple = buildModel([
        { title: 'Главная', attributes: { component: ['cart', 'header'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyPlaywrightReport(new Validator({}), multiple, report, ['@component', 'assertionTitle']);

      expect(assertionOf(multiple, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(multiple, 'Утверждение').automationState).toBe('Unknown');
    });

    it('Если у фичи не проставлен атрибут, указанный в keys, тест с ней не сопоставляется', () => {
      const report = buildPlaywrightReport([{ file: 'cart.spec.ts', suites: ['cart'], title: 'Утверждение' }]);

      // контроль: с проставленным атрибутом тот же тест сопоставляется
      const marked = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyPlaywrightReport(new Validator({}), marked, report, ['@component', 'assertionTitle']);

      expect(assertionOf(marked, 'Утверждение').matchedTests).toEqual([
        { source: 'playwright', name: 'cart / Утверждение', filePath: 'cart.spec.ts' },
      ]);

      const unmarked = buildModel([{ title: 'Главная', groups: { Группа: ['Утверждение'] } }]);
      applyPlaywrightReport(new Validator({}), unmarked, report, ['@component', 'assertionTitle']);

      expect(assertionOf(unmarked, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(unmarked, 'Утверждение').automationState).toBe('Unknown');
    });
  });

  describe('Разбор отчета', () => {
    it('Полное имя теста собирается из названий вложенных suites и названия теста', () => {
      const model = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
        // ФТ с названием файла в идентификаторе — контроль того, что имя файла в полное имя не попадает
        { title: 'cart.spec.ts', groups: { 'Главная страница': ['Отображается корзина'] } },
      ]);
      const report = buildPlaywrightReport([
        { file: 'cart.spec.ts', suites: ['Главная страница', 'Блок корзины'], title: 'Отображается корзина' },
      ]);

      applyPlaywrightReport(new Validator({}), model, report, KEYS);

      expect(allAssertions(model).map(({ matchedTests }) => matchedTests)).toEqual([
        [
          {
            source: 'playwright',
            name: 'Главная страница / Блок корзины / Отображается корзина',
            filePath: 'cart.spec.ts',
          },
        ],
        [],
      ]);
    });

    it('Тест, у которого ожидается статус passed, делает ФТ автоматизированным', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildPlaywrightReport([
        { file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Утверждение', expectedStatus: 'passed' },
      ]);

      applyPlaywrightReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').automationState).toBe('Automated');
    });

    it('Тест, у которого ожидается любой другой статус, помечает ФТ как проблемный', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Пропущенный', 'Упавший'] } }]);
      const report = buildPlaywrightReport([
        { file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Пропущенный', expectedStatus: 'skipped' },
        { file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Упавший', expectedStatus: 'failed' },
      ]);

      applyPlaywrightReport(new Validator({}), model, report, KEYS);

      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Problem', 'Problem']);
    });
  });

  describe('Сопоставленные тесты', () => {
    it('Тест, полное имя которого совпало с идентификатором ФТ, добавляется в модель как сопоставленный с этим ФТ', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildPlaywrightReport([{ file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Утверждение' }]);

      applyPlaywrightReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'playwright', name: 'Ф / Г / Утверждение', filePath: 'cart.spec.ts' },
      ]);
    });

    it('Тесты с одинаковым полным именем из разных файлов дают ФТ два сопоставленных теста', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildPlaywrightReport([
        { file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Утверждение' },
        { file: 'checkout.spec.ts', suites: ['Ф', 'Г'], title: 'Утверждение' },
      ]);

      applyPlaywrightReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'playwright', name: 'Ф / Г / Утверждение', filePath: 'cart.spec.ts' },
        { source: 'playwright', name: 'Ф / Г / Утверждение', filePath: 'checkout.spec.ts' },
      ]);
    });

    it('Если идентификаторы двух ФТ совпадают, тест сопоставляется с обоими', () => {
      const model = buildModel([
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
        // вторая фича с тем же названием — идентификатор ФТ получается тот же
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
      ]);
      const report = buildPlaywrightReport([{ file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Утверждение' }]);

      applyPlaywrightReport(new Validator({}), model, report, KEYS);

      const matched = { source: 'playwright', name: 'Ф / Г / Утверждение', filePath: 'cart.spec.ts' };
      expect(allAssertions(model).map(({ matchedTests }) => matchedTests)).toEqual([[matched], [matched]]);
      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Automated', 'Automated']);
    });

    it('Тест, не сопоставленный ни с одним ФТ, попадает в отчет как тест без описания', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildPlaywrightReport([
        // контроль: сопоставленный тест в отчет не попадет, в отчете останется только лишний
        { file: 'cart.spec.ts', suites: ['Ф', 'Г'], title: 'Утверждение' },
        { file: 'extra.spec.ts', suites: ['Ф', 'Г'], title: 'Лишний тест' },
      ]);

      applyPlaywrightReport(validator, model, report, KEYS);

      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружен интеграционный playwright тест без описания',
          details: ['Ф / Г / Лишний тест'],
          filePath: 'extra.spec.ts',
        },
      ]);
    });
  });
});
