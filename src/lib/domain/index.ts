import {
  Attribute as CfgAttribute,
  AttributeValue as CfgAttributeValue,
  Tree as CfgTree,
} from '../config';
import { Meta } from '../config/models';
import { YamlFile, Assertion as YmlAssertion } from '../yaml';
import {
  Assertion,
  AssertionGroup,
  Attribute,
  AttributeValue,
  Feature,
  ProjectData,
  Tree,
} from './models';

export { getAttributesContext, getKey } from './keys';
export type { AssertionContext, AttributesContext } from './keys';
export type {
  Assertion, AssertionGroup, Attribute,
  AttributeValue, Feature, ProjectData, Tree
} from './models';

const mapAssertion = ({
  assert: title,
  description,
}: YmlAssertion): Assertion => ({
  title,
  description,
  isAutomated: false,
});

const mapGroup = ([title, list]: [string, YmlAssertion[]]): AssertionGroup => {
  const assertions = list.map(mapAssertion);

  return { title, assertions };
};

const mapFeature = ({ content, fileName, filePath }: YamlFile): Feature => {
  const {
    code,
    feature: title,
    description,
    definitions: attributes,
    'specs-unit': specs = {},
  } = content;

  const groups = Object.entries(specs).map(mapGroup);

  return { code, title, description, groups, attributes, fileName, filePath };
};

const mapAttributeValue = ({
  code,
  title,
}: CfgAttributeValue): AttributeValue => ({ code, title });

const mapAttribute = ({ code, title, values }: CfgAttribute): Attribute => {
  return {
    title,
    code,
    values: values.map(mapAttributeValue),
  };
};

const mapTree = ({ code, title, 'group-by': attributes }: CfgTree): Tree => {
  return {
    title,
    code,
    attributes,
  };
};

export const processYamlFiles = (
  files: YamlFile[],
  meta: Meta
): ProjectData => {
  const features = files.map(mapFeature);
  const attributes = meta.attributes?.map(mapAttribute);
  const trees = meta.trees?.map(mapTree);

  return { features, attributes, trees };
};
