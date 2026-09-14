import { describe, expect, it } from 'vitest';

import { applyJestReport } from '../src/lib/jest';
import { applyStorybookIndex } from '../src/lib/storybook';
import { Validator } from '../src/lib/validators';
import { assertionOf, buildJestReport, buildModel, buildStorybookIndex, readReport } from './helpers';

const KEYS = ['featureTitle', 'groupTitle', 'assertionTitle'];

// модель с двумя ФТ: у первого два сопоставленных теста, у второго ни одного
const withDuplicateAndUncovered = (validator: Validator) => {
  const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['С дубликатом', 'Без тестов'] } }]);

  applyJestReport(
    validator,
    model,
    buildJestReport([
      { file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
      { file: 'checkout.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
    ]),
    KEYS,
  );

  return model;
};

const duplicateEntry = {
  severity: 'WARN',
  message: 'Утверждение проверяется несколькими тестами: С дубликатом (группа Г)',
  details: ['jest Ф / Г / С дубликатом cart.test.ts', 'jest Ф / Г / С дубликатом checkout.test.ts'],
  filePath: 'specs/cart.yml',
};

const notCoveredEntry = {
  severity: 'WARN',
  message: 'Утверждение не проверяется тестами: Без тестов (группа Г)',
  details: [],
  filePath: 'specs/cart.yml',
};

describe('Валидация', () => {
  describe('Дубликаты тестов', () => {
    it('Если с одним ФТ сопоставлено два и более теста, валидация сообщает о дубликате', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['С дубликатом'] } }]);

      applyJestReport(
        validator,
        model,
        buildJestReport([
          { file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
          { file: 'checkout.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
        ]),
        KEYS,
      );
      validator.validateTests(model);

      expect(readReport(validator).entries).toEqual([duplicateEntry]);
    });

    it('Если с ФТ сопоставлен ровно один тест, дубликат не регистрируется', () => {
      const validator = new Validator({});
      const model = buildModel([
        { title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['С одним тестом', 'С дубликатом'] } },
      ]);

      applyJestReport(
        validator,
        model,
        buildJestReport([
          {
            file: 'cart.test.ts',
            tests: [
              { ancestors: ['Ф', 'Г'], title: 'С одним тестом' },
              { ancestors: ['Ф', 'Г'], title: 'С дубликатом' },
            ],
          },
          { file: 'checkout.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
        ]),
        KEYS,
      );
      validator.validateTests(model);

      // в отчете только ФТ с двумя тестами, ФТ с одним тестом в него не попало
      expect(readReport(validator).entries).toEqual([duplicateEntry]);
    });

    it('Тесты из разных источников учитываются вместе, поэтому jest-тест и история storybook с одинаковым идентификатором образуют дубликат', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['Утверждение'] } }]);

      applyJestReport(
        validator,
        model,
        buildJestReport([{ file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'Утверждение' }] }]),
        KEYS,
      );
      applyStorybookIndex(
        validator,
        model,
        buildStorybookIndex([{ title: 'Ф/Г', name: 'Утверждение', importPath: './src/Cart.stories.tsx' }]),
        { indexPath: 'index.json', keys: KEYS },
      );

      expect(assertionOf(model, 'Утверждение').matchedTests).toEqual([
        { source: 'jest', name: 'Ф / Г / Утверждение', filePath: 'cart.test.ts' },
        { source: 'storybook', name: 'Ф / Г / Утверждение', filePath: './src/Cart.stories.tsx' },
      ]);

      validator.validateTests(model);

      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Утверждение проверяется несколькими тестами: Утверждение (группа Г)',
          details: ['jest Ф / Г / Утверждение cart.test.ts', 'storybook Ф / Г / Утверждение ./src/Cart.stories.tsx'],
          filePath: 'specs/cart.yml',
        },
      ]);
    });

    it('В сообщении об ошибке перечислены все сопоставленные тесты с указанием источника, полного имени и пути к файлу', () => {
      const validator = new Validator({});
      const model = withDuplicateAndUncovered(validator);

      validator.validateTests(model);

      expect(readReport(validator).entries[0].details).toEqual([
        'jest Ф / Г / С дубликатом cart.test.ts',
        'jest Ф / Г / С дубликатом checkout.test.ts',
      ]);
    });
  });

  describe('ФТ без тестов', () => {
    it('Если с ФТ не сопоставлено ни одного теста, валидация сообщает о непокрытом ФТ', () => {
      const validator = new Validator({ 'assertion-not-covered': 'warning' });
      const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['Без тестов'] } }]);

      validator.validateTests(model);

      expect(readReport(validator).entries).toEqual([notCoveredEntry]);
    });

    it('Если с ФТ сопоставлен хотя бы один тест, непокрытое ФТ не регистрируется', () => {
      const validator = new Validator({ 'assertion-not-covered': 'warning', 'assertion-duplicate-test': 'off' });
      const model = withDuplicateAndUncovered(validator);

      validator.validateTests(model);

      // в отчете только ФТ без тестов, покрытое ФТ в него не попало
      expect(readReport(validator).entries).toEqual([notCoveredEntry]);
    });

    it('Тест со статусом skipped или pending считается покрытием', () => {
      const validator = new Validator({ 'assertion-not-covered': 'warning' });
      const model = buildModel([
        { title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['Отложенный', 'Пропущенный', 'Без тестов'] } },
      ]);

      applyJestReport(
        validator,
        model,
        buildJestReport([
          {
            file: 'cart.test.ts',
            tests: [
              { ancestors: ['Ф', 'Г'], title: 'Отложенный', status: 'pending' },
              { ancestors: ['Ф', 'Г'], title: 'Пропущенный', status: 'skipped' },
            ],
          },
        ]),
        KEYS,
      );
      validator.validateTests(model);

      // тесты есть, хотя и не выполнялись: ФТ помечены проблемными, но покрытыми —
      // в отчете осталось только ФТ, с которым не сопоставлен ни один тест
      expect(assertionOf(model, 'Отложенный').automationState).toBe('Problem');
      expect(assertionOf(model, 'Пропущенный').automationState).toBe('Problem');
      expect(readReport(validator).entries).toEqual([notCoveredEntry]);
    });

    it('Если в конфиге не подключен ни один источник тестов, о непокрытии сообщается для всех ФТ проекта', () => {
      const validator = new Validator({ 'assertion-not-covered': 'warning' });
      const model = buildModel([
        { title: 'Ф1', filePath: 'specs/cart.yml', groups: { Г: ['Первое', 'Второе'] } },
        { title: 'Ф2', filePath: 'specs/checkout.yml', groups: { Г: ['Третье'] } },
      ]);

      // ни один applyReport не вызывается — источников в конфиге нет
      validator.validateTests(model);

      expect(readReport(validator).entries.map(({ message }) => message)).toEqual([
        'Утверждение не проверяется тестами: Первое (группа Г)',
        'Утверждение не проверяется тестами: Второе (группа Г)',
        'Утверждение не проверяется тестами: Третье (группа Г)',
      ]);
    });

    it('В сообщении об ошибке указаны название ФТ, название группы и путь к yml файлу', () => {
      const validator = new Validator({ 'assertion-not-covered': 'warning' });
      const model = buildModel([
        { title: 'Ф', filePath: 'specs/cart.yml', groups: { 'Блок корзины': ['Отображается корзина'] } },
      ]);

      validator.validateTests(model);

      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Утверждение не проверяется тестами: Отображается корзина (группа Блок корзины)',
          details: [],
          filePath: 'specs/cart.yml',
        },
      ]);
    });
  });

  describe('Тесты без описания', () => {
    it('Тест, сопоставленный с ФТ, не попадает в отчет как тест без описания', () => {
      const validator = new Validator({});
      const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['Утверждение'] } }]);

      applyJestReport(
        validator,
        model,
        buildJestReport([
          {
            file: 'cart.test.ts',
            tests: [
              { ancestors: ['Ф', 'Г'], title: 'Утверждение' },
              { ancestors: ['Ф', 'Г'], title: 'Лишний тест' },
            ],
          },
        ]),
        KEYS,
      );
      validator.validateTests(model);

      // в отчете только несопоставленный тест
      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружен тест без описания',
          details: ['Ф / Г / Лишний тест'],
          filePath: 'cart.test.ts',
        },
      ]);
    });

    it('Если с одним ФТ сопоставлено несколько тестов, ни один из них не попадает в отчет как тест без описания', () => {
      const validator = new Validator({ 'assertion-duplicate-test': 'off' });
      const model = buildModel([{ title: 'Ф', filePath: 'specs/cart.yml', groups: { Г: ['С дубликатом'] } }]);

      applyJestReport(
        validator,
        model,
        buildJestReport([
          { file: 'cart.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
          { file: 'checkout.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'С дубликатом' }] },
          { file: 'extra.test.ts', tests: [{ ancestors: ['Ф', 'Г'], title: 'Лишний тест' }] },
        ]),
        KEYS,
      );
      validator.validateTests(model);

      // оба сопоставленных теста в отчет не попали, остался только несопоставленный
      expect(readReport(validator).entries).toEqual([
        {
          severity: 'WARN',
          message: 'Обнаружен тест без описания',
          details: ['Ф / Г / Лишний тест'],
          filePath: 'extra.test.ts',
        },
      ]);
    });
  });

  describe('Уровни правил', () => {
    it('По умолчанию дубликат тестов регистрируется как предупреждение', () => {
      const validator = new Validator({});
      const model = withDuplicateAndUncovered(validator);

      validator.validateTests(model);
      const { entries, summary } = readReport(validator);

      expect(entries).toEqual([duplicateEntry]);
      expect(summary).toBe('Всего предупреждений:  1');
      expect(validator.hasCriticalErrors).toBe(false);
    });

    it('По умолчанию проверка непокрытых ФТ выключена и в отчет не попадает', () => {
      const validator = new Validator({});
      const model = withDuplicateAndUncovered(validator);

      validator.validateTests(model);

      // в модели есть ФТ без тестов, но в отчете только дубликат
      expect(assertionOf(model, 'Без тестов').matchedTests).toEqual([]);
      expect(readReport(validator).entries).toEqual([duplicateEntry]);
    });

    it('Уровень каждого правила переопределяется в секции validation конфигурационного файла', () => {
      const validator = new Validator({ 'assertion-duplicate-test': 'error' });
      const model = withDuplicateAndUncovered(validator);

      validator.validateTests(model);

      expect(readReport(validator).entries).toEqual([{ ...duplicateEntry, severity: 'ERROR' }]);
    });

    it('Правило с уровнем error прерывает выполнение команды', () => {
      const warning = new Validator({});
      warning.validateTests(withDuplicateAndUncovered(warning));

      // контроль: на уровне предупреждения команда не прерывается
      expect(warning.hasCriticalErrors).toBe(false);

      const error = new Validator({ 'assertion-duplicate-test': 'error' });
      error.validateTests(withDuplicateAndUncovered(error));

      // на этом признаке команды sync и validate завершаются с ошибкой
      expect(error.hasCriticalErrors).toBe(true);
    });
  });
});
