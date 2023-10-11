import {
  Assertion,
  AssertionGroup,
  Attribute,
  AttributeValue,
  Feature,
  Tree,
} from '../domain';

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
  field:
    | 'description'
    | 'title'
    | 'group.title'
    | 'assert.title'
    | 'assert.description';
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
  | JestUnusedTestError;

export type ValidationErrorTypes = ValidationError['type'];

export type ErrorSeverity = 'info' | 'warning' | 'error';

export const ERROR_SEVERITY: { [key in ValidationErrorTypes]: ErrorSeverity } = {
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
};
