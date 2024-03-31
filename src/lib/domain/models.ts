export type FeatureType = 'Functional' | 'Visual';

export type AutomationState = 'Unknown' | 'Automated' | 'Problem';

export interface Assertion {
  title: string;
  description?: string;
  automationState: AutomationState;
}

export interface AssertionGroup {
  title: string;
  assertions: Assertion[];
}

export interface Feature {
  code: string;
  title: string;
  description?: string;
  type?: FeatureType;

  groups: AssertionGroup[];
  attributes?: Record<string, string[]>;

  fileName: string;
  filePath: string;
}

export interface AttributeValue {
  code: string;
  title: string;
}

export interface Attribute {
  code: string;
  title: string;
  values: AttributeValue[];
}

export interface Tree {
  title: string;
  code: string;
  attributes: string[];
}

export interface ProjectData {
  features: Feature[];

  attributes?: Attribute[];
  trees?: Tree[];
  metaFilePath: string;
}
