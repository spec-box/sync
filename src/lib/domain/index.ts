import {
  ProjectData,
  Feature,
  AssertionGroup,
  Assertion,
  Attribute,
  AttributeValue,
  Tree,
} from "./models";
import { YamlFile, Assertion as YmlAssertion } from "../yaml";
import {
  YmlConfig,
  Tree as CfgTree,
  Attribute as CfgAttribute,
  AttributeValue as CfgAttributeValue,
} from "../config";

export type {
  ProjectData,
  Feature,
  AssertionGroup,
  Assertion,
  Attribute,
  AttributeValue,
} from "./models";
export type { AssertionContext, AttributesContext } from "./keys";
export { getKey, getAttributesContext } from "./keys";

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
    feature: title,
    description,
    definitions: attributes,
    "specs-unit": specs = {},
  } = content;

  // TODO: формировать код по конфигу
  const component = attributes?.component.join("-");
  const subComponent = attributes?.["sub-component"].join("-");
  const code = `${component}_${subComponent}`;

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

const mapTree = ({ code, title, attributes }: CfgTree): Tree => {
  return {
    title,
    code,
    attributes,
  };
};

export const processYamlFiles = (
  files: YamlFile[],
  ymlConfig: YmlConfig
): ProjectData => {
  const features = files.map(mapFeature);
  const attributes = ymlConfig.attributes?.map(mapAttribute);
  const trees = ymlConfig.trees?.map(mapTree);

  return { features, attributes, trees };
};
