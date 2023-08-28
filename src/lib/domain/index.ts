import {
  ProjectData,
  Feature,
  AssertionGroup,
  Assertion,
  Attribute,
  AttributeValue,
} from "./models";
import { YamlFile, Assertion as YmlAssertion } from "../yaml";
import {
  YmlConfig,
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

const mapAssertion = ({ assert: title }: YmlAssertion): Assertion => {
  const description = undefined; // TODO: брать из yml

  return {
    title,
    description,
    isAutomated: false,
  };
};

const mapGroup = ([title, list]: [string, YmlAssertion[]]): AssertionGroup => {
  const assertions = list.map(mapAssertion);

  return { title, assertions };
};

const mapFeature = ({ content, fileName, filePath }: YamlFile): Feature => {
  const {
    feature: title,
    definitions: attributes,
    "specs-unit": specs = {},
  } = content;

  const description = undefined; // TODO: брать из yml

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

export const processYamlFiles = (
  files: YamlFile[],
  { attributes = [] }: YmlConfig
): ProjectData => {
  const allAttributes = attributes.map(mapAttribute);
  const features = files.map(mapFeature);

  return { features, allAttributes };
};
