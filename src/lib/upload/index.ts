import {
  TmsWebApi,
  UploadData,
  AssertionModel,
  AssertionGroupModel,
  FeatureModel,
} from "../../api";
import { ApiConfig } from "../config/models";
import { ProjectData } from "../domain";
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

function buildRequestBody(entities: Feature[]): UploadData {
  return {
    features: entities.map(mapFeature),
  };
}

export const uploadEntities = async (
  { features }: ProjectData,
  config: ApiConfig
) => {
  const { host, project } = config;

  const client = new TmsWebApi(host);

  const body = buildRequestBody(features);

  await client.apiUpload({ project, body });
};
