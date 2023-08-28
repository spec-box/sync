import {
  SpecBoxWebApi,
  UploadData,
  AssertionModel,
  AssertionGroupModel,
  FeatureModel,
  AttributeModel,
  AttributeValueModel,
} from "../../api";
import { ApiConfig } from "../config/models";
import { Attribute, AttributeValue, ProjectData } from "../domain";
import { Assertion, AssertionGroup, Feature } from "../domain";

const mapAssertion = ({
  title,
  description,
  isAutomated,
}: Assertion): AssertionModel => {
  return {
    title,
    description,
    isAutomated,
  };
};

const mapGroup = ({
  title,
  assertions,
}: AssertionGroup): AssertionGroupModel => {
  return { title, assertions: assertions.map(mapAssertion) };
};

const mapFeature = ({
  title,
  code,
  attributes,
  groups,
}: Feature): FeatureModel => {
  return {
    title,
    code,
    attributes,
    groups: groups.map(mapGroup),
  };
};

const mapAttributeValue = ({
  title,
  code,
}: AttributeValue): AttributeValueModel => ({
  title,
  code,
});

const mapAttribute = ({ title, code, values }: Attribute): AttributeModel => ({
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

  const body: UploadData = {
    features: features.map(mapFeature),
    attributes: allAttributes.map(mapAttribute),
  };

  await client.apiUpload({ project, body });
};
