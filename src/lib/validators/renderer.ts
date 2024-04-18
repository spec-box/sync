import chalk from 'chalk';
import { ValidationError } from './models';
import { ValidationSeverity } from '../config';

const renderError = (e: ValidationError): string => {
  switch (e.type) {
    case 'loader-error':
      return `Ошибка чтения ${strong(e.fileType)} файла\n${val(e.description)}`;
    case 'code-format-error':
      return `Неправильный формат кода: ${val(e.code)}`;
    case 'attribute-duplicate':
      return `Дубликат кода атрибута: ${val(e.attribute.code)}`;
    case 'attribute-value-duplicate':
      return `Дубликат кода значения атрибута: ${val(e.attributeValue.code)} (атрибут ${val(e.attribute.code)})`;
    case 'tree-duplicate':
      return `Дубликат кода описания дерева: ${val(e.tree.code)}`;
    case 'tree-missing-attribute':
      return `Неизвестный атрибут в дереве: ${val(e.attributeCode)} (дерево ${val(e.tree.code)})`;
    case 'tree-attribute-duplicate':
      return `Повторяющийся атрибут в описании дерева: ${val(e.attributeCode)} (дерево ${val(e.tree.code)})`;
    case 'featrue-code-format':
      return `Неправильный формат кода фичи: ${val(e.code)}`;
    case 'featrue-attribute-value-code-format':
      return `Неправильный формат кода значения атрибута фичи: ${val(e.code)} (атрибут ${val(e.attribute)})`;
    case 'feature-code-duplicate':
      return `Дубликат кода фичи: ${val(e.code)}`;
    case 'feature-missing-attribute':
      return `Неизвестный атрибут: ${val(e.attributeCode)}`;
    case 'feature-missing-link':
      return `Неизвестная ссылка: ${val(e.link)}`;
    case 'assertion-duplicate':
      return `Дубликат утверждения: ${val(e.assertion.title)} (группа ${val(e.assertionGroup.title)})`;
    case 'jest-unused':
      return `Обнаружен тест без описания\n${val(e.test)}`;
    case 'storybook-unused':
      return `Обнаружена история без описания\n${val(e.story)}`;
  }
};

const path = (p: string) => chalk.gray(p);
const strong = (p: string) => chalk.bold(p);
const val = (p: string) => chalk.cyan(p);

const errorBadge = (p: string | number) => chalk.bgRed(` ${p} `);
const warnBadge = (p: string | number) => chalk.bgYellow(chalk.black(` ${p} `));
const infoBadge = (p: string | number) => chalk.bgBlackBright(` ${p} `);

const formatSeverity = (s: ValidationSeverity): string | undefined => {
  switch (s) {
    case 'error':
      return errorBadge('ERROR');
    case 'warning':
      return warnBadge('WARN');
    case 'info':
      return infoBadge('INFO');
  }
};

export const printError = (e: ValidationError, config: Record<string, ValidationSeverity>) => {
  const severity = formatSeverity(config[e.type]);

  if (severity) {
    console.log(`${severity} ${renderError(e)}\n${path(e.filePath)}\n`);
  }
};

export const renderStats = (title: string, errors: ValidationError[], config: Record<string, ValidationSeverity>) => {
  if (errors.length === 0) {
    return;
  }
  const errorsCount = errors.filter((e) => config[e.type] === 'error').length;
  const warnsCount = errors.filter((e) => config[e.type] === 'warning').length;
  if (!errorsCount && !warnsCount) {
    console.log(`${chalk.green('Ошибки валидации не обнаружены')}`);
    return;
  }

  let report = '';
  if (errorsCount) {
    report += `ошибок: ${errorBadge(errorsCount)}`;
  }
  if (errorsCount && warnsCount) {
    report += ` / `;
  }
  if (warnsCount) {
    report += `предупреждений: ${warnBadge(warnsCount)}`;
  }
  console.log(`${title} ${report}`);
};
