import { describe, expect, it } from 'vitest';

import { applyStorybookIndex } from '../src/lib/storybook';
import { Validator } from '../src/lib/validators';
import { allAssertions, assertionOf, buildModel, buildStorybookIndex, readReport } from './helpers';

const KEYS = ['featureTitle', 'groupTitle', 'assertionTitle'];

// indexPath не влияет на поведение: индекс передается в applyStorybookIndex уже разобранным
const config = (keys: string[], publicUrl?: string) => ({ indexPath: 'index.json', keys, publicUrl });

describe('Поддержка storybook', () => {
  describe('Идентификатор ФТ', () => {
    it('Идентификатор ФТ собирается из перечисленных в keys сегментов, в указанном порядке', () => {
      const index = buildStorybookIndex([
        { title: 'Главная страница/Блок корзины', name: 'Отображается корзина', importPath: './src/Cart.stories.tsx' },
      ]);

      const matching = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyStorybookIndex(new Validator({}), matching, index, config(['featureTitle', 'groupTitle', 'assertionTitle']));

      expect(assertionOf(matching, 'Отображается корзина').matchedTests).toEqual([
        {
          source: 'storybook',
          name: 'Главная страница / Блок корзины / Отображается корзина',
          filePath: './src/Cart.stories.tsx',
        },
      ]);

      // тот же индекс, обратный порядок сегментов — идентификатор другой, совпадения нет
      const reversed = buildModel([
        { title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);
      applyStorybookIndex(new Validator({}), reversed, index, config(['assertionTitle', 'groupTitle', 'featureTitle']));

      expect(assertionOf(reversed, 'Отображается корзина').matchedTests).toEqual([]);
    });

    it('Для сегмента, заданного через символ собаки, подставляется код значения атрибута фичи', () => {
      // мета-информация не нужна: подставляется код значения, а не его название
      const model = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      const index = buildStorybookIndex([{ title: 'cart', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]);

      applyStorybookIndex(new Validator({}), model, index, config(['@component', 'assertionTitle']));

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'storybook', name: 'cart / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);
    });

    it('Для сегмента, заданного через символ доллара, подставляется название значения атрибута фичи', () => {
      const model = buildModel(
        [{ title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } }],
        [{ code: 'component', title: 'Компонент', values: [{ code: 'cart', title: 'Корзина' }] }],
      );
      const index = buildStorybookIndex([
        { title: 'Корзина', name: 'Утверждение', importPath: './src/Cart.stories.tsx' },
      ]);

      applyStorybookIndex(new Validator({}), model, index, config(['$component', 'assertionTitle']));

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'storybook', name: 'Корзина / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);
    });

    it('Если у фичи несколько значений атрибута, указанного в keys, история с ней не сопоставляется', () => {
      const index = buildStorybookIndex([{ title: 'cart', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]);

      // контроль: с одним значением атрибута та же история сопоставляется
      const single = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyStorybookIndex(new Validator({}), single, index, config(['@component', 'assertionTitle']));

      expect(assertionOf(single, 'Утверждение').matchedTests).toEqual([
        { source: 'storybook', name: 'cart / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);

      const multiple = buildModel([
        { title: 'Главная', attributes: { component: ['cart', 'header'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyStorybookIndex(new Validator({}), multiple, index, config(['@component', 'assertionTitle']));

      expect(assertionOf(multiple, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(multiple, 'Утверждение').automationState).toBe('Unknown');
    });

    it('Если у фичи не проставлен атрибут, указанный в keys, история с ней не сопоставляется', () => {
      const index = buildStorybookIndex([{ title: 'cart', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]);

      // контроль: с проставленным атрибутом та же история сопоставляется
      const marked = buildModel([
        { title: 'Главная', attributes: { component: ['cart'] }, groups: { Группа: ['Утверждение'] } },
      ]);
      applyStorybookIndex(new Validator({}), marked, index, config(['@component', 'assertionTitle']));

      expect(assertionOf(marked, 'Утверждение').matchedTests).toEqual([
        { source: 'storybook', name: 'cart / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);

      const unmarked = buildModel([{ title: 'Главная', groups: { Группа: ['Утверждение'] } }]);
      applyStorybookIndex(new Validator({}), unmarked, index, config(['@component', 'assertionTitle']));

      expect(assertionOf(unmarked, 'Утверждение').matchedTests).toEqual([]);
      expect(assertionOf(unmarked, 'Утверждение').automationState).toBe('Unknown');
    });
  });

  describe('Разбор индекса', () => {
    it('Полное имя истории собирается из title, разбитого по косой черте, и name', () => {
      const model = buildModel([{ title: 'Главная страница', groups: { 'Блок корзины': ['Отображается корзина'] } }]);
      const index = buildStorybookIndex([
        // title без косой черты — полное имя короче, совпадения не будет
        { title: 'Главная страница', name: 'Отображается корзина', importPath: './src/Flat.stories.tsx' },
        {
          title: 'Главная страница/Блок корзины',
          name: 'Отображается корзина',
          importPath: './src/Cart.stories.tsx',
        },
      ]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS));

      expect(assertionOf(model, 'Отображается корзина').matchedTests).toEqual([
        {
          source: 'storybook',
          name: 'Главная страница / Блок корзины / Отображается корзина',
          filePath: './src/Cart.stories.tsx',
        },
      ]);
    });

    it('Написанная история делает ФТ автоматизированным', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([{ title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS));

      expect(assertionOf(model, 'Утверждение').automationState).toBe('Automated');
    });
  });

  describe('Ссылка на историю', () => {
    it('Если в настройках указан publicUrl, у сопоставленного ФТ появляется ссылка на историю', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([
        { id: 'cart--default', title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' },
      ]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS, 'https://sb.example/'));

      expect(assertionOf(model, 'Утверждение').detailsUrl).toBe(
        'https://sb.example/iframe.html?viewMode=story&id=cart--default',
      );
    });

    it('Если publicUrl не указан, ссылка у ФТ не проставляется', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([
        { id: 'cart--default', title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' },
      ]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS));

      // контроль: история сопоставилась, ссылки нет именно из-за отсутствия publicUrl
      const assertion = assertionOf(model, 'Утверждение');
      expect(assertion.matchedTests).toEqual([
        { source: 'storybook', name: 'Ф / Г / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);
      expect(assertion.detailsUrl).toBeUndefined();
    });
  });

  describe('Сопоставленные тесты', () => {
    it('История, полное имя которой совпало с идентификатором ФТ, добавляется в модель как сопоставленная с этим ФТ', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([{ title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS));

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'storybook', name: 'Ф / Г / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);
    });

    it('Несколько историй с одинаковым полным именем дают ФТ несколько сопоставленных тестов', () => {
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([
        { title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' },
        { title: 'Ф/Г', name: 'Утверждение', importPath: './src/Checkout.stories.tsx' },
      ]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS));

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'storybook', name: 'Ф / Г / Утверждение', filePath: './src/Cart.stories.tsx' },
        { source: 'storybook', name: 'Ф / Г / Утверждение', filePath: './src/Checkout.stories.tsx' },
      ]);
    });

    it('Если идентификаторы двух ФТ совпадают, история сопоставляется с обоими', () => {
      const model = buildModel([
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
        // вторая фича с тем же названием — идентификатор ФТ получается тот же
        { title: 'Ф', groups: { Г: ['Утверждение'] } },
      ]);
      const index = buildStorybookIndex([{ title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]);

      applyStorybookIndex(new Validator({}), model, index, config(KEYS));

      const matched = { source: 'storybook', name: 'Ф / Г / Утверждение', filePath: './src/Cart.stories.tsx' };
      expect(allAssertions(model).map(({ matchedTests }) => matchedTests)).toEqual([[matched], [matched]]);
    });

    it('История, не сопоставленная ни с одним ФТ, попадает в отчет как история без описания', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([
        // контроль: сопоставленная история в отчет не попадет, в отчете останется только лишняя
        { title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' },
        { title: 'Ф/Г', name: 'Лишняя история', importPath: './src/Extra.stories.tsx' },
      ]);

      applyStorybookIndex(validator, model, index, config(KEYS));

      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружена история без описания',
          details: ['Ф / Г / Лишняя история'],
          filePath: './src/Extra.stories.tsx',
        },
      ]);
    });

    it('Несколько историй с одинаковым полным именем, не сопоставленных ни с одним ФТ, дают в отчете одну запись', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', groups: { Г: ['Утверждение'] } }]);
      const index = buildStorybookIndex([
        { title: 'Ф/Г', name: 'Лишняя история', importPath: './src/ExtraA.stories.tsx' },
        { title: 'Ф/Г', name: 'Лишняя история', importPath: './src/ExtraB.stories.tsx' },
      ]);

      applyStorybookIndex(validator, model, index, config(KEYS));

      // в отчете одна запись, путь — от последней истории с таким именем
      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружена история без описания',
          details: ['Ф / Г / Лишняя история'],
          filePath: './src/ExtraB.stories.tsx',
        },
      ]);
    });
  });
});
