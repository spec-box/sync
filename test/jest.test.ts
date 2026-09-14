import { describe, expect, it } from 'vitest';

import { applyJestReport } from '../src/lib/jest';
import { Validator } from '../src/lib/validators';
import { allAssertions, assertionOf, buildJestReport, buildModel, readReport } from './helpers';

const KEYS = ['featureTitle', 'groupTitle', 'assertionTitle'];

describe('Поддержка jest', () => {
  describe('Идентификатор ФТ', () => {
    it('Идентификатор ФТ собирается из перечисленных в keys сегментов, в указанном порядке', () => {
      const report = buildJestReport([
        {
          file: 'cart.test.ts',
          tests: [{ ancestors: ['Главная страница', 'Блок корзины'], title: 'Отображается корзина' }],
        },
      ]);

      const matching = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyJestReport(new Validator({}), matching, report, ['featureTitle', 'groupTitle', 'assertionTitle']);

      expect(assertionOf(matching, 'Отображается корзина').matchedTests).toEqual([
        { source: 'jest', name: 'Главная страница / Блок корзины / Отображается корзина', filePath: 'cart.test.ts' },
      ]);

      // тот же отчет, обратный порядок сегментов — идентификатор другой, совпадения нет
      const reversed = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyJestReport(new Validator({}), reversed, report, ['assertionTitle', 'groupTitle', 'featureTitle']);

      expect(assertionOf(reversed, 'Отображается корзина').matchedTests).toEqual([]);
    });

    it('Для сегмента, заданного через символ собаки, подставляется код значения атрибута фичи', () => {
      // мета-информация не нужна: подставляется код значения, а не его название
      const model = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['cart'], title: 'Утверждение' }] },
      ]);

      applyJestReport(new Validator({}), model, report, ['@component', 'assertionTitle']);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'cart / Утверждение', filePath: 'cart.test.ts' },
      ]);
    });

    it('Для сегмента, заданного через символ доллара, подставляется название значения атрибута фичи', () => {
      const model = buildModel(
        [{ title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } }],
        [{ code: 'component', title: 'Компонент', values: [{ code: 'cart', title: 'Корзина' }] }],
      );
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['Корзина'], title: 'Утверждение' }] },
      ]);

      applyJestReport(new Validator({}), model, report, ['$component', 'assertionTitle']);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'Корзина / Утверждение', filePath: 'cart.test.ts' },
      ]);
    });

    it('Если у фичи несколько значений атрибута, указанного в keys, тест с ней не сопоставляется', () => {
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['cart'], title: 'Утверждение' }] },
      ]);

      // контроль: с одним значением атрибута тот же тест сопоставляется
      const single = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyJestReport(new Validator({}), single, report, ['@component', 'assertionTitle']);

      expect(assertionOf(single, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'cart / Утверждение', filePath: 'cart.test.ts' },
      ]);

      const multiple = buildModel([
        { title: 'Главная', attributes: { component: ['cart', 'header'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyJestReport(new Validator({}), multiple, report, ['@component', 'assertionTitle']);

      expect(assertionOf(multiple, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(multiple, 'Утверждение').automationState).toBe('Unknown');
    });

    it('Если у фичи не проставлен атрибут, указанный в keys, тест с ней не сопоставляется', () => {
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['cart'], title: 'Утверждение' }] },
      ]);

      // контроль: с проставленным атрибутом тот же тест сопоставляется
      const marked = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyJestReport(new Validator({}), marked, report, ['@component', 'assertionTitle']);

      expect(assertionOf(marked, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'cart / Утверждение', filePath: 'cart.test.ts' },
      ]);

      const unmarked = buildModel([{ title: 'Главная', groups: { Группа: ['Утверждение'] } }]);
      applyJestReport(new Validator({}), unmarked, report, ['@component', 'assertionTitle']);

      expect(assertionOf(unmarked, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(unmarked, 'Утверждение').automationState).toBe('Unknown');
    });
  });

  describe('Разбор отчета', () => {
    it('Полное имя теста собирается из ancestorTitles и title', () => {
      const model = buildModel([{ title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } }]);
      const report = buildJestReport([
        {
          file: 'cart.test.ts',
          tests: [
            // тот же title, но без ancestorTitles — полное имя другое, совпадения не будет
            { title: 'Отображается корзина' },
            { ancestors: ['Главная страница', 'Блок корзины'], title: 'Отображается корзина' },
          ],
        },
      ]);

      applyJestReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Отображается корзина').matchedTests).toEqual([
        { source: 'jest', name: 'Главная страница / Блок корзины / Отображается корзина', filePath: 'cart.test.ts' },
      ]);
    });

    it('Тест со статусом passed или failed делает ФТ автоматизированным', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Успешный', 'Упавший'] } }]);
      const report = buildJestReport([
        {
          file: 'cart.test.ts',
          tests: [
            { ancestors: ['Ф', 'Г'], title: 'Успешный', status: 'passed' },
            { ancestors: ['Ф', 'Г'], title: 'Упавший', status: 'failed' },
          ],
        },
      ]);

      applyJestReport(new Validator({}), model, report, KEYS);

      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Automated', 'Automated']);
    });

    it('Тест со статусом pending или skipped помечает ФТ как проблемный', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Отложенный', 'Пропущенный'] } }]);
      const report = buildJestReport([
        {
          file: 'cart.test.ts',
          tests: [
            { ancestors: ['Ф', 'Г'], title: 'Отложенный', status: 'pending' },
            { ancestors: ['Ф', 'Г'], title: 'Пропущенный', status: 'skipped' },
          ],
        },
      ]);

      applyJestReport(new Validator({}), model, report, KEYS);

      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Problem', 'Problem']);
    });
  });

  describe('Сопоставленные тесты', () => {
    it('Тест, полное имя которого совпало с идентификатором ФТ, добавляется в модель как сопоставленный с этим ФТ', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'Утверждение' }] },
      ]);

      applyJestReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'Ф / Г / Утверждение', filePath: 'cart.test.ts' },
      ]);
    });

    it('Два теста с одинаковым полным именем из разных файлов дают ФТ два сопоставленных теста', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'Утверждение' }] },
        { file: 'checkout.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'Утверждение' }] },
      ]);

      applyJestReport(new Validator({}), model, report, KEYS);

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'Ф / Г / Утверждение', filePath: 'cart.test.ts' },
        { source: 'jest', name: 'Ф / Г / Утверждение', filePath: 'checkout.test.ts' },
      ]);
    });

    it('Если идентификаторы двух ФТ совпадают, тест сопоставляется с обоими', () => {
      const model = buildModel([
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
        // вторая фича с тем же названием — идентификатор ФТ получается тот же
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
      ]);
      const report = buildJestReport([
        { file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'Утверждение' }] },
      ]);

      applyJestReport(new Validator({}), model, report, KEYS);

      const matched = { source: 'jest', name: 'Ф / Г / Утверждение', filePath: 'cart.test.ts' };
      expect(allAssertions(model).map(({ matchedTests }) => matchedTests)).toEqual([[matched], [matched]]);
      expect(allAssertions(model).map(({ automationState }) => automationState)).toEqual(['Automated', 'Automated']);
    });

    it('Тест, не сопоставленный ни с одним ФТ, попадает в отчет как тест без описания', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['Утверждение'] } }]);
      const report = buildJestReport([
        {
          file: 'cart.test.ts',
          tests: [
            // контроль: сопоставленный тест в отчет не попадет, в отчете останется только лишний
            { ancestors: ['Ф', 'Г'], title: 'Утверждение' },
            { ancestors: ['Ф', 'Г'], title: 'Лишний тест' },
          ],
        },
      ]);

      applyJestReport(validator, model, report, KEYS);

      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружен тест без описания',
          details: ['Ф / Г / Лишний тест'],
          filePath: 'cart.test.ts',
        },
      ]);
    });
  });
});
