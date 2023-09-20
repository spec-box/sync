import * as coreClient from "@azure/core-client";

export interface SpecBoxWebApiModelUploadData {
  features: SpecBoxWebApiModelUploadFeatureModel[];
  attributes: SpecBoxWebApiModelUploadAttributeModel[];
}

export interface SpecBoxWebApiModelUploadFeatureModel {
  code: string;
  title: string;
  description?: string;
  filePath?: string;
  groups: SpecBoxWebApiModelUploadAssertionGroupModel[];
  /** Dictionary of <components·1i2d5w·schemas·specbox-webapi-model-upload-featuremodel·properties·attributes·additionalproperties> */
  attributes?: { [propertyName: string]: string[] | null };
}

export interface SpecBoxWebApiModelUploadAssertionGroupModel {
  title: string;
  assertions: SpecBoxWebApiModelUploadAssertionModel[];
}

export interface SpecBoxWebApiModelUploadAssertionModel {
  title: string;
  description?: string;
  isAutomated: boolean;
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

export interface SpecBoxWebApiModelProjectFeatureModel {
  code: string;
  title: string;
  description?: string;
  /** NOTE: This property will not be serialized. It can only be populated by the server. */
  readonly assertionGroups: SpecBoxWebApiModelProjectAssertionGroupModel[];
}

export interface SpecBoxWebApiModelProjectAssertionGroupModel {
  title: string;
  /** NOTE: This property will not be serialized. It can only be populated by the server. */
  readonly assertions: SpecBoxWebApiModelProjectAssertionModel[];
}

export interface SpecBoxWebApiModelProjectAssertionModel {
  title: string;
  description?: string;
  isAutomated: boolean;
}

export interface SpecBoxWebApiModelProjectStructureModel {
  tree: SpecBoxWebApiModelProjectTreeNodeModel[];
}

export interface SpecBoxWebApiModelProjectTreeNodeModel {
  id: string;
  path: string[];
  parentId?: string;
  featureCode?: string;
  title: string;
  totalCount: number;
  automatedCount: number;
}

export interface SpecBoxWebApiModelStatAutotestsStatUploadData {
  timestamp: Date;
  duration: number;
  assertionsCount: number;
}

/** Optional parameters. */
export interface ExportUploadOptionalParams
  extends coreClient.OperationOptions {
  body?: SpecBoxWebApiModelUploadData;
  project?: string;
}

/** Optional parameters. */
export interface ProjectsProjectFeaturesFeatureOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the projectsProjectFeaturesFeature operation. */
export type ProjectsProjectFeaturesFeatureResponse = SpecBoxWebApiModelProjectFeatureModel;

/** Optional parameters. */
export interface ProjectsProjectStructureOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the projectsProjectStructure operation. */
export type ProjectsProjectStructureResponse = SpecBoxWebApiModelProjectStructureModel;

/** Optional parameters. */
export interface StatAutotestsUploadOptionalParams
  extends coreClient.OperationOptions {
  project?: string;
  body?: SpecBoxWebApiModelStatAutotestsStatUploadData;
}

/** Optional parameters. */
export interface StatAutotestsOptionalParams
  extends coreClient.OperationOptions {
  project?: string;
  from?: string;
  to?: string;
}

/** Optional parameters. */
export interface StatAssertionsOptionalParams
  extends coreClient.OperationOptions {
  project?: string;
  from?: Date;
  to?: Date;
}

/** Optional parameters. */
export interface SpecBoxWebApiOptionalParams
  extends coreClient.ServiceClientOptions {
  /** Overrides client endpoint. */
  endpoint?: string;
}
