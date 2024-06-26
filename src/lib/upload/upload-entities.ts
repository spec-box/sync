import {
  SpecBoxWebApi,
  SpecBoxWebApiModelUploadData,
  SpecBoxWebApiModelUploadAssertionModel,
  SpecBoxWebApiModelUploadAssertionGroupModel,
  SpecBoxWebApiModelUploadFeatureModel,
  SpecBoxWebApiModelUploadAttributeModel,
  SpecBoxWebApiModelUploadAttributeValueModel,
  SpecBoxWebApiModelUploadTreeModel,
} from '../../api';
import { ApiConfig } from '../config/models';
import { Attribute, AttributeValue, ProjectData } from '../domain';
import { Assertion, AssertionGroup, Feature } from '../domain';
import { Tree } from '../domain/models';
import { DEFAULT_API_OPTIONS, normalizePath } from '../utils';

const mapAssertion = ({
  title,
  description,
  detailsUrl,
  automationState,
}: Assertion): SpecBoxWebApiModelUploadAssertionModel => {
  return {
    title,
    description,
    detailsUrl,
    automationState,
  };
};

const mapGroup = ({ title, assertions }: AssertionGroup): SpecBoxWebApiModelUploadAssertionGroupModel => {
  return { title, assertions: assertions.map(mapAssertion) };
};

const mapFeature = ({
  code,
  type: featureType,
  title,
  description,
  filePath,
  attributes,
  groups,
  dependencies,
}: Feature): SpecBoxWebApiModelUploadFeatureModel => {
  return {
    code,
    featureType,
    title,
    description,
    attributes,
    filePath: normalizePath(filePath),
    groups: groups.map(mapGroup),
    dependencies,
  };
};

const mapAttributeValue = ({ title, code }: AttributeValue): SpecBoxWebApiModelUploadAttributeValueModel => ({
  title,
  code,
});

const mapAttribute = ({ title, code, values }: Attribute): SpecBoxWebApiModelUploadAttributeModel => ({
  title,
  code,
  values: values.map(mapAttributeValue),
});

const mapTree = ({ title, code, attributes }: Tree): SpecBoxWebApiModelUploadTreeModel => ({
  title,
  code,
  attributes,
});

export const uploadEntities = async (data: ProjectData, config: ApiConfig, message?: string) => {
  const { features, attributes = [], trees = [] } = data;
  const { host, project } = config;

  const client = new SpecBoxWebApi(host, DEFAULT_API_OPTIONS);

  const body: SpecBoxWebApiModelUploadData = {
    features: features.map(mapFeature),
    attributes: attributes?.map(mapAttribute),
    trees: trees?.map(mapTree),
    message,
  };

  await client.exportUpload({ project, body });
};
