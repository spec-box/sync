import chalk from 'chalk';
import { ERROR_SEVERITY, ErrorSeverity, ValidationError, ValidationErrorTypes } from './models';

const renderError = (e: ValidationError): string => {
  switch(e.type){
    case 'loader-error':
      return `Чтения ${e.fileType} файла: \n ${chalk.red(e.description)}`;
    case 'code-format-error':
      return `Формат кода: английские буквы и цифры, подчеркивание, дефис, начинается с буквы: \n   ${chalk.red(e.code)}`;
    case 'attribute-duplicate':
      return `Дубликат кода атрибута: \n   ${chalk.red(e.attribute.code)}`;
    case 'attribute-value-duplicate':
      return `Дубликат кода значения атрибута: \n   ${chalk.green(e.attribute.code)} / ${chalk.red(e.attributeValue.code)}`;
    case 'tree-duplicate':
      return `Дубликат кода описания дерева: \n   ${chalk.red(e.tree.code)}`;
    case 'tree-missing-attribute':
      return `Неизвестный атрибут в дереве: \n   ${chalk.green(e.tree.code)} / ${chalk.red(e.attributeCode)}`;
    case 'tree-attribute-duplicate':
      return `Повторяющийся атрибут в описании дерева: \n   ${chalk.green(e.tree)} / ${chalk.red(e.attributeCode)}`;
    case 'featrue-code-format':
      return `Формат кода фичи: английские буквы и цифры, подчеркивание, дефис, начинается с буквы: \n   ${chalk.red(e.code)}`;
    case 'featrue-attribute-value-code-format':
      return `Формат кода значения атрибута фичи: английские буквы и цифры, подчеркивание, дефис, начинается с буквы: \n   ${chalk.green(e.attribute)} / ${chalk.red(e.code)}`;
    case 'feature-code-duplicate':
      return `Дубликат кода фичи: \n   ${chalk.red(e.code)} - Ранее встречался в: ${e.firstFeature.filePath}`;
    case 'feature-missing-attribute':
      return `Неизвестный атрибут: \n   ${chalk.red(e.attributeCode)}`;
    case 'feature-missing-link':
      return `Неизвестная ссылка в поле ${chalk.bold(e.field)}: \n   ${chalk.red(e.link)}`;
    case 'assertion-group-duplicate':
      return `Дубликат группы утверджений: \n   ${chalk.red(e.assertionGroup.title)}`;
    case 'assertion-duplicate':
      return `Дубликат утверждения: \n   ${chalk.green(e.assertionGroup.title)} / ${chalk.red(e.assertion)}`;
    case 'jest-unused':
      return `Обнаружен тест без описания: \n   ${chalk.yellow(e.test)}`;
  }
}

const formatSeverity = (s: ErrorSeverity): string => {
  if(s === 'error') {
    return chalk.redBright(s);
  } else if(s === 'warning') {
    return chalk.yellow(s);
  }
  return s;
}
export const printError = (e: ValidationError) => {
  const severity = formatSeverity(ERROR_SEVERITY[e.type]);
  console.log(`${severity}: ${chalk.blue(e.filePath)} - ${renderError(e)}`);
}
