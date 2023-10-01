import { Attribute, AttributeValue, Tree } from './config';
import { Feature } from './domain';

export type AttributeDuplicateError = {
  type: 'attribute-duplicate';
  attribute: Attribute;
};
export type AttributeValueDuplicateError = {
  type: 'attribute-value-duplicate';
  attribute: Attribute;
  attributeValue: AttributeValue;
};
export type CodeError = {
  type: 'code-format-error';
  code: string;
};
export type TreeDuplicateError = {
  type: 'tree-duplicate';
  tree: Tree;
};
export type TreeMissingAttributeError = {
  type: 'tree-missing-attribute';
  tree: Tree;
  attributeCode: string;
};
export type TreeAttributeDuplicateError = {
  type: 'tree-attribute-duplicate';
  tree: Tree;
  attributeCode: string;
};
export type FeatureCodeError = {
  type: 'featrue-code-format-error';
  feature: Feature;
  code: string;
};
export type FeatureCodeDuplicateError = {
  type: 'feature-code-duplicate';
  feature: Feature;
  firstFeature: Feature;
  code: string;
};
export type FeatureMissingAttributeError = {
  type: 'feature-missing-attribute';
  feature: Feature;
  attributeCode: string;
};
export type FeatureMissingAttributeValueError = {
  type: 'feature-missing-attribute-value';
  feature: Feature;
  attribute: string;
  attributeValue: string;
};

export type ValidationError =
  | AttributeDuplicateError
  | AttributeValueDuplicateError
  | TreeDuplicateError
  | TreeMissingAttributeError
  | TreeAttributeDuplicateError
  | FeatureCodeError
  | FeatureCodeDuplicateError
  | FeatureMissingAttributeError
  | FeatureMissingAttributeValueError
  | CodeError;

export type FileValidationError = {
  path: string;
  errors: ValidationError[] | undefined;
};

export type ValidatorFn<F> = (value: F) => ValidationError[];

export const CODE_REGEX = /^[A-Za-z][A-Za-z0-9-_]*$/;

export const validateCode = (value: string): CodeError | undefined => {
  if (!CODE_REGEX.test(value)) {
    return { type: 'code-format-error', code: value };
  }
};
