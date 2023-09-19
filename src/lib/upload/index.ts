import {
  SpecBoxWebApi,
  SpecBoxWebApiModelUploadData,
  SpecBoxWebApiModelUploadAssertionModel,
  SpecBoxWebApiModelUploadAssertionGroupModel,
  SpecBoxWebApiModelUploadFeatureModel,
  SpecBoxWebApiModelUploadAttributeModel,
  SpecBoxWebApiModelUploadAttributeValueModel,
} from "../../api";
import { ApiConfig } from "../config/models";
import { Attribute, AttributeValue, ProjectData } from "../domain";
import { Assertion, AssertionGroup, Feature } from "../domain";

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
    filePath,
    attributes,
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

const mapAttribute = ({ title, code, values }: Attribute): SpecBoxWebApiModelUploadAttributeModel => ({
  title,
  code,
  values: values.map(mapAttributeValue),
});

export const uploadEntities = async (
  { features, allAttributes }: ProjectData,
  config: ApiConfig
) => {
  const { host, project } = config;

  const client = new SpecBoxWebApi(host, { allowInsecureConnection: true });

  const body: SpecBoxWebApiModelUploadData = {
    features: features.map(mapFeature),
    attributes: allAttributes.map(mapAttribute),
  };

  await client.exportUpload({ project, body });
};
