import * as coreClient from "@azure/core-client";
import * as Parameters from "./models/parameters";
import * as Mappers from "./models/mappers";
import {
  SpecBoxWebApiOptionalParams,
  ExportUploadOptionalParams,
  ProjectsProjectFeaturesFeatureOptionalParams,
  ProjectsProjectFeaturesFeatureResponse,
  ProjectsProjectStructureOptionalParams,
  ProjectsProjectStructureResponse
} from "./models";

export class SpecBoxWebApi extends coreClient.ServiceClient {
  $host: string;

  /**
   * Initializes a new instance of the SpecBoxWebApi class.
   * @param $host server parameter
   * @param options The parameter options
   */
  constructor($host: string, options?: SpecBoxWebApiOptionalParams) {
    if ($host === undefined) {
      throw new Error("'$host' cannot be null");
    }

    // Initializing default values for options
    if (!options) {
      options = {};
    }
    const defaults: SpecBoxWebApiOptionalParams = {
      requestContentType: "application/json; charset=utf-8"
    };

    const packageDetails = `azsdk-js-specBoxWebApi/1.0.0-beta.1`;
    const userAgentPrefix =
      options.userAgentOptions && options.userAgentOptions.userAgentPrefix
        ? `${options.userAgentOptions.userAgentPrefix} ${packageDetails}`
        : `${packageDetails}`;

    const optionsWithDefaults = {
      ...defaults,
      ...options,
      userAgentOptions: {
        userAgentPrefix
      },
      endpoint: options.endpoint ?? options.baseUri ?? "{$host}"
    };
    super(optionsWithDefaults);
    // Parameter assignments
    this.$host = $host;
  }

  /** @param options The options parameters. */
  exportUpload(options?: ExportUploadOptionalParams): Promise<void> {
    return this.sendOperationRequest({ options }, exportUploadOperationSpec);
  }

  /**
   * @param project
   * @param feature
   * @param options The options parameters.
   */
  projectsProjectFeaturesFeature(
    project: string,
    feature: string,
    options?: ProjectsProjectFeaturesFeatureOptionalParams
  ): Promise<ProjectsProjectFeaturesFeatureResponse> {
    return this.sendOperationRequest(
      { project, feature, options },
      projectsProjectFeaturesFeatureOperationSpec
    );
  }

  /**
   * @param project
   * @param options The options parameters.
   */
  projectsProjectStructure(
    project: string,
    options?: ProjectsProjectStructureOptionalParams
  ): Promise<ProjectsProjectStructureResponse> {
    return this.sendOperationRequest(
      { project, options },
      projectsProjectStructureOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const exportUploadOperationSpec: coreClient.OperationSpec = {
  path: "/export/upload",
  httpMethod: "POST",
  responses: { 200: {} },
  requestBody: Parameters.body,
  queryParameters: [Parameters.project],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.contentType],
  mediaType: "json",
  serializer
};
const projectsProjectFeaturesFeatureOperationSpec: coreClient.OperationSpec = {
  path: "/projects/{project}/features/{feature}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.SpecBoxWebApiModelProjectFeatureModel
    }
  },
  urlParameters: [Parameters.$host, Parameters.project1, Parameters.feature],
  headerParameters: [Parameters.accept],
  serializer
};
const projectsProjectStructureOperationSpec: coreClient.OperationSpec = {
  path: "/projects/{project}/structure",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.SpecBoxWebApiModelProjectStructureModel
    }
  },
  urlParameters: [Parameters.$host, Parameters.project1],
  headerParameters: [Parameters.accept],
  serializer
};
