import {
  OperationURLParameter,
  OperationParameter,
  OperationQueryParameter
} from "@azure/core-client";
import { UploadData as UploadDataMapper } from "../models/mappers";

export const $host: OperationURLParameter = {
  parameterPath: "$host",
  mapper: {
    serializedName: "$host",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};

export const contentType: OperationParameter = {
  parameterPath: ["options", "contentType"],
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Content-Type",
    type: {
      name: "String"
    }
  }
};

export const body: OperationParameter = {
  parameterPath: ["options", "body"],
  mapper: UploadDataMapper
};

export const project: OperationQueryParameter = {
  parameterPath: ["options", "project"],
  mapper: {
    serializedName: "project",
    type: {
      name: "String"
    }
  }
};
