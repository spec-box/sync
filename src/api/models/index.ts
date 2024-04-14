import * as coreClient from '@azure/core-client';

export interface SpecBoxWebApiModelDefaultConfigurationModel {
  metrikaCounterId?: string;
}

export interface SpecBoxWebApiModelUploadData {
  features: SpecBoxWebApiModelUploadFeatureModel[];
  attributes: SpecBoxWebApiModelUploadAttributeModel[];
  trees: SpecBoxWebApiModelUploadTreeModel[];
}

export interface SpecBoxWebApiModelUploadFeatureModel {
  code: string;
  title: string;
  featureType?: FeatureType;
  description?: string;
  filePath?: string;
  groups: SpecBoxWebApiModelUploadAssertionGroupModel[];
  /** Dictionary of <components·1i2d5w·schemas·specbox-webapi-model-upload-featuremodel·properties·attributes·additionalproperties> */
  attributes?: { [propertyName: string]: string[] | null };
  dependencies?: string[];
}

export interface SpecBoxWebApiModelUploadAssertionGroupModel {
  title: string;
  assertions: SpecBoxWebApiModelUploadAssertionModel[];
}

export interface SpecBoxWebApiModelUploadAssertionModel {
  title: string;
  description?: string;
  isAutomated?: boolean;
  automationState?: AutomationState;
}

export interface SpecBoxWebApiModelUploadAttributeModel {
  code: string;
  title: string;
  values: SpecBoxWebApiModelUploadAttributeValueModel[];
}

export interface SpecBoxWebApiModelUploadAttributeValueModel {
  code: string;
  title: string;
}

export interface SpecBoxWebApiModelUploadTreeModel {
  code: string;
  title: string;
  attributes: string[];
}

export interface SpecBoxWebApiModelCommonProjectModel {
  code: string;
  title: string;
  description?: string;
  repositoryUrl?: string;
}

export interface SpecBoxWebApiModelProjectFeatureModel {
  code: string;
  title: string;
  featureType?: FeatureType;
  description?: string;
  filePath?: string;
  /** NOTE: This property will not be serialized. It can only be populated by the server. */
  readonly assertionGroups: SpecBoxWebApiModelProjectAssertionGroupModel[];
}

export interface SpecBoxWebApiModelProjectAssertionGroupModel {
  title: string;
  sortOrder?: number;
  /** NOTE: This property will not be serialized. It can only be populated by the server. */
  readonly assertions: SpecBoxWebApiModelProjectAssertionModel[];
}

export interface SpecBoxWebApiModelProjectAssertionModel {
  title: string;
  description?: string;
  sortOrder?: number;
  automationState: AutomationState;
}

export interface SpecBoxWebApiModelProjectStructureModel {
  project: SpecBoxWebApiModelCommonProjectModel;
  tree: SpecBoxWebApiModelProjectTreeNodeModel[];
}

export interface SpecBoxWebApiModelProjectTreeNodeModel {
  id: string;
  parentId?: string;
  featureCode?: string;
  featureType?: FeatureType;
  title?: string;
  totalCount: number;
  automatedCount: number;
  problemCount: number;
  sortOrder?: number;
}

export interface SpecBoxWebApiModelStatAutotestsStatUploadData {
  timestamp: Date;
  duration: number;
  assertionsCount: number;
}

export interface SpecBoxWebApiModelStatModel {
  project: SpecBoxWebApiModelCommonProjectModel;
  assertions: SpecBoxWebApiModelStatAssertionsStatModel[];
  autotests: SpecBoxWebApiModelStatAutotestsStatModel[];
}

export interface SpecBoxWebApiModelStatAssertionsStatModel {
  timestamp: Date;
  totalCount: number;
  automatedCount: number;
  problemCount: number;
}

export interface SpecBoxWebApiModelStatAutotestsStatModel {
  timestamp: Date;
  duration: number;
  assertionsCount: number;
}

/** Defines values for FeatureType. */
export type FeatureType = 'Functional' | 'Visual';
/** Defines values for AutomationState. */
export type AutomationState = 'Unknown' | 'Automated' | 'Problem';

/** Optional parameters. */
export interface ConfigOptionalParams extends coreClient.OperationOptions {}

/** Contains response data for the config operation. */
export type ConfigResponse = SpecBoxWebApiModelDefaultConfigurationModel;

/** Optional parameters. */
export interface ExportUploadOptionalParams extends coreClient.OperationOptions {
  body?: SpecBoxWebApiModelUploadData;
  project?: string;
}

/** Optional parameters. */
export interface ProjectsListOptionalParams extends coreClient.OperationOptions {}

/** Contains response data for the projectsList operation. */
export type ProjectsListResponse = SpecBoxWebApiModelCommonProjectModel[];

/** Optional parameters. */
export interface ProjectsProjectFeaturesFeatureOptionalParams extends coreClient.OperationOptions {}

/** Contains response data for the projectsProjectFeaturesFeature operation. */
export type ProjectsProjectFeaturesFeatureResponse = SpecBoxWebApiModelProjectFeatureModel;

/** Optional parameters. */
export interface ProjectsProjectStructureOptionalParams extends coreClient.OperationOptions {}

/** Contains response data for the projectsProjectStructure operation. */
export type ProjectsProjectStructureResponse = SpecBoxWebApiModelProjectStructureModel;

/** Optional parameters. */
export interface StatUploadAutotestsOptionalParams extends coreClient.OperationOptions {
  project?: string;
  body?: SpecBoxWebApiModelStatAutotestsStatUploadData;
}

/** Optional parameters. */
export interface StatOptionalParams extends coreClient.OperationOptions {
  project?: string;
  from?: Date;
  to?: Date;
}

/** Contains response data for the stat operation. */
export type StatResponse = SpecBoxWebApiModelStatModel;

/** Optional parameters. */
export interface SpecBoxWebApiOptionalParams extends coreClient.ServiceClientOptions {
  /** Overrides client endpoint. */
  endpoint?: string;
}
