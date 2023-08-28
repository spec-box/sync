import * as coreClient from "@azure/core-client";
import * as Parameters from "./models/parameters";
import * as Mappers from "./models/mappers";
import {
  SpecBoxWebApiOptionalParams,
  ApiProjectsOptionalParams,
  ApiUploadOptionalParams
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
  apiProjects(options?: ApiProjectsOptionalParams): Promise<void> {
    return this.sendOperationRequest({ options }, apiProjectsOperationSpec);
  }

  /** @param options The options parameters. */
  apiUpload(options?: ApiUploadOptionalParams): Promise<void> {
    return this.sendOperationRequest({ options }, apiUploadOperationSpec);
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const apiProjectsOperationSpec: coreClient.OperationSpec = {
  path: "/api/projects",
  httpMethod: "GET",
  responses: { 200: {} },
  urlParameters: [Parameters.$host],
  serializer
};
const apiUploadOperationSpec: coreClient.OperationSpec = {
  path: "/api/upload",
  httpMethod: "POST",
  responses: { 200: {} },
  requestBody: Parameters.body,
  queryParameters: [Parameters.project],
  urlParameters: [Parameters.$host],
  headerParameters: [Parameters.contentType],
  mediaType: "json",
  serializer
};
