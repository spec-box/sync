import { ValidationSeverity } from '../config';
import { Assertion, AssertionGroup, Attribute, AttributeValue, Feature, Tree } from '../domain';

export type AttributeDuplicateError = {
  type: 'attribute-duplicate';
  filePath: string;
  attribute: Attribute;
};
export type AttributeValueDuplicateError = {
  type: 'attribute-value-duplicate';
  filePath: string;
  attribute: Attribute;
  attributeValue: AttributeValue;
};
export type CodeError = {
  type: 'code-format-error';
  filePath: string;
  code: string;
};
export type TreeDuplicateError = {
  type: 'tree-duplicate';
  filePath: string;
  tree: Tree;
};
export type TreeMissingAttributeError = {
  type: 'tree-missing-attribute';
  filePath: string;
  tree: Tree;
  attributeCode: string;
};
export type TreeAttributeDuplicateError = {
  type: 'tree-attribute-duplicate';
  filePath: string;
  tree: Tree;
  attributeCode: string;
};
export type FeatureCodeError = {
  type: 'featrue-code-format';
  filePath: string;
  feature: Feature;
  code: string;
};
export type FeatureAttributeValueCodeError = {
  type: 'featrue-attribute-value-code-format';
  filePath: string;
  feature: Feature;
  attribute: string;
  code: string;
};
export type FeatureCodeDuplicateError = {
  type: 'feature-code-duplicate';
  filePath: string;
  feature: Feature;
  firstFeature: Feature;
  code: string;
};
export type FeatureMissingAttributeError = {
  type: 'feature-missing-attribute';
  filePath: string;
  feature: Feature;
  attributeCode: string;
};
export type FeatureMissingLinkError = {
  type: 'feature-missing-link';
  filePath: string;
  feature: Feature;
  link: string;
};

export type AssertionDuplicateError = {
  type: 'assertion-duplicate';
  filePath: string;
  feature: Feature;
  assertionGroup: AssertionGroup;
  assertion: Assertion;
};
export type LoaderError = {
  type: 'loader-error';
  filePath: string;
  fileType: 'config' | 'feature';
  description: string;
};
export type JestUnusedTestError = {
  type: 'jest-unused';
  filePath: string;
  test: string;
};
export type StorybookUnusedStoryError = {
  type: 'storybook-unused';
  filePath: string;
  story: string;
};
export type TestplaneUnusedTestError = {
  type: 'testplane-unused';
  filePath: string;
  test: string;
};
export type PlaywrightUnusedTestError = {
  type: 'playwright-unused';
  filePath: string;
  test: string;
};

export type ValidationError =
  | AttributeDuplicateError
  | AttributeValueDuplicateError
  | TreeDuplicateError
  | TreeMissingAttributeError
  | TreeAttributeDuplicateError
  | FeatureCodeError
  | FeatureAttributeValueCodeError
  | FeatureCodeDuplicateError
  | FeatureMissingAttributeError
  | FeatureMissingLinkError
  | AssertionDuplicateError
  | CodeError
  | LoaderError
  | JestUnusedTestError
  | StorybookUnusedStoryError
  | TestplaneUnusedTestError
  | PlaywrightUnusedTestError;

export type ValidationErrorTypes = ValidationError['type'];

export const DEFAULT_ERROR_SEVERITY: { [key in ValidationErrorTypes]: ValidationSeverity } = {
  'loader-error': 'error',
  'code-format-error': 'error',
  'attribute-duplicate': 'error',
  'attribute-value-duplicate': 'error',
  'tree-duplicate': 'error',
  'tree-missing-attribute': 'error',
  'tree-attribute-duplicate': 'error',
  'assertion-duplicate': 'error',
  'featrue-code-format': 'error',
  'feature-code-duplicate': 'error',
  'feature-missing-attribute': 'error',
  'featrue-attribute-value-code-format': 'error',
  'feature-missing-link': 'warning',
  'jest-unused': 'warning',
  'storybook-unused': 'warning',
  'testplane-unused': 'warning',
  'playwright-unused': 'warning',
};
