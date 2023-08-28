import * as coreClient from "@azure/core-client";

export interface UploadData {
  features: FeatureModel[];
  attributes: AttributeModel[];
}

export interface FeatureModel {
  code: string;
  title: string;
  description?: string;
  groups: AssertionGroupModel[];
  /** Dictionary of <components·jx2eru·schemas·featuremodel·properties·attributes·additionalproperties> */
  attributes?: { [propertyName: string]: string[] | null };
}

export interface AssertionGroupModel {
  title: string;
  assertions: AssertionModel[];
}

export interface AssertionModel {
  title: string;
  description?: string;
  isAutomated: boolean;
}

export interface AttributeModel {
  code: string;
  title: string;
  values: AttributeValueModel[];
}

export interface AttributeValueModel {
  code: string;
  title: string;
}

/** Optional parameters. */
export interface ApiProjectsOptionalParams
  extends coreClient.OperationOptions {}

/** Optional parameters. */
export interface ApiUploadOptionalParams extends coreClient.OperationOptions {
  body?: UploadData;
  project?: string;
}

/** Optional parameters. */
export interface SpecBoxWebApiOptionalParams
  extends coreClient.ServiceClientOptions {
  /** Overrides client endpoint. */
  endpoint?: string;
}
