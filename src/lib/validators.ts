import { inherits } from "util";

export type ValidationError = {
  code: string;
  value: string;
  description: string;
};
export type FileValidationError = {
  path: string;
  errors: ValidationError[] | undefined;
};

const CODE_REGEX = /^[A-Za-z][A-Za-z0-9-_]*$/;

export const validateCode = (code: string): ValidationError[] => {
  if (CODE_REGEX.test(code)) {
    return [];
  }
  return [
    {
      code: "code-invalid",
      value: code,
      description:
        "Код может содержать только английские буквы и цифры, подчеркивание и дефис, начинается с буквы",
    },
  ];
};

export type SelectorFn<T, R> = (model: T) => R;
export type ValidatorFn<F> = (value: F) => ValidationError[];

type SelectorWithValidatorsTuple<T, R> = [
  selector: SelectorFn<T, R>,
  validators: ValidatorFn<R>[]
];

export class Validator<T> {
  private rules = new Array<SelectorWithValidatorsTuple<T, any>>();

  constructor(...rules: SelectorWithValidatorsTuple<T, any>[]) {
    for (const rule of rules) {
      this.register(rule[0], rule[1]);
    }
  }

  register<R>(selector: SelectorFn<T, R>, validators: ValidatorFn<R>[]) {
    this.rules.push([selector, validators]);
  }

  validate(model: T | T[]): ValidationError[] {
    const result = new Array<ValidationError>();
    const models = Array.isArray(model) ? model : [model];

    for (const validatorGroup of this.rules) {
      for (const model of models) {
        const fieldValue = validatorGroup[0](model);
        for (const validator of validatorGroup[1]) {
          result.push(...validator(fieldValue));
        }
      }
    }

    return result;
  }
}
