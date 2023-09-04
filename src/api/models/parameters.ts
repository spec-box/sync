import {
  OperationParameter,
  OperationURLParameter,
  OperationQueryParameter
} from "@azure/core-client";
import { SpecBoxWebApiModelUploadData as SpecBoxWebApiModelUploadDataMapper } from "../models/mappers";

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
  mapper: SpecBoxWebApiModelUploadDataMapper
};

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

export const project: OperationQueryParameter = {
  parameterPath: ["options", "project"],
  mapper: {
    serializedName: "project",
    type: {
      name: "String"
    }
  }
};

export const accept: OperationParameter = {
  parameterPath: "accept",
  mapper: {
    defaultValue: "application/json, text/json",
    isConstant: true,
    serializedName: "Accept",
    type: {
      name: "String"
    }
  }
};

export const project1: OperationURLParameter = {
  parameterPath: "project",
  mapper: {
    serializedName: "project",
    required: true,
    type: {
      name: "String"
    }
  }
};

export const feature: OperationURLParameter = {
  parameterPath: "feature",
  mapper: {
    serializedName: "feature",
    required: true,
    type: {
      name: "String"
    }
  }
};
