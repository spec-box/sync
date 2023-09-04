import * as coreClient from "@azure/core-client";

export interface SpecBoxWebApiModelUploadData {
  features: SpecBoxWebApiModelUploadFeatureModel[];
  attributes: SpecBoxWebApiModelUploadAttributeModel[];
}

export interface SpecBoxWebApiModelUploadFeatureModel {
  code: string;
  title: string;
  description?: string;
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
  readonly assertionGroups?: SpecBoxWebApiModelProjectAssertionGroupModel[];
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

/** Optional parameters. */
export interface ApiExportUploadOptionalParams
  extends coreClient.OperationOptions {
  body?: SpecBoxWebApiModelUploadData;
  project?: string;
}

/** Optional parameters. */
export interface ApiProjectsProjectFeaturesFeatureOptionalParams
  extends coreClient.OperationOptions {}

/** Contains response data for the apiProjectsProjectFeaturesFeature operation. */
export type ApiProjectsProjectFeaturesFeatureResponse = SpecBoxWebApiModelProjectFeatureModel;

/** Optional parameters. */
export interface SpecBoxWebApiOptionalParams
  extends coreClient.ServiceClientOptions {
  /** Overrides client endpoint. */
  endpoint?: string;
}
