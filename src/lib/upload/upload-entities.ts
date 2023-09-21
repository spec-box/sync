import {
  SpecBoxWebApi,
  SpecBoxWebApiModelUploadData,
  SpecBoxWebApiModelUploadAssertionModel,
  SpecBoxWebApiModelUploadAssertionGroupModel,
  SpecBoxWebApiModelUploadFeatureModel,
  SpecBoxWebApiModelUploadAttributeModel,
  SpecBoxWebApiModelUploadAttributeValueModel,
  SpecBoxWebApiModelUploadTreeModel,
} from "../../api";
import { ApiConfig } from "../config/models";
import { Attribute, AttributeValue, ProjectData } from "../domain";
import { Assertion, AssertionGroup, Feature } from "../domain";
import { Tree } from "../domain/models";
import { normalizePath } from "../utils";

const mapAssertion = ({
  title,
  description,
  isAutomated,
}: Assertion): SpecBoxWebApiModelUploadAssertionModel => {
  return {
    title,
    description,
    isAutomated,
  };
};

const mapGroup = ({
  title,
  assertions,
}: AssertionGroup): SpecBoxWebApiModelUploadAssertionGroupModel => {
  return { title, assertions: assertions.map(mapAssertion) };
};

const mapFeature = ({
  code,
  title,
  description,
  filePath,
  attributes,
  groups,
}: Feature): SpecBoxWebApiModelUploadFeatureModel => {
  return {
    code,
    title,
    description,
    attributes,
    filePath: normalizePath(filePath),
    groups: groups.map(mapGroup),
  };
};

const mapAttributeValue = ({
  title,
  code,
}: AttributeValue): SpecBoxWebApiModelUploadAttributeValueModel => ({
  title,
  code,
});

const mapAttribute = ({
  title,
  code,
  values,
}: Attribute): SpecBoxWebApiModelUploadAttributeModel => ({
  title,
  code,
  values: values.map(mapAttributeValue),
});

const mapTree = ({
  title,
  code,
  attributes,
}: Tree): SpecBoxWebApiModelUploadTreeModel => ({
  title,
  code,
  attributes,
});

export const uploadEntities = async (
  { features, attributes = [], trees = [] }: ProjectData,
  config: ApiConfig
) => {
  const { host, project } = config;

  const client = new SpecBoxWebApi(host, { allowInsecureConnection: true });

  const body: SpecBoxWebApiModelUploadData = {
    features: features.map(mapFeature),
    attributes: attributes?.map(mapAttribute),
    trees: trees?.map(mapTree),
  };

  await client.exportUpload({ project, body });
};
