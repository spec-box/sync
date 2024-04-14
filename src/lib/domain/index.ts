import { ParsedValue, parse } from '@spec-box/text-parser';

import { Attribute as CfgAttribute, AttributeValue as CfgAttributeValue, Tree as CfgTree } from '../config';
import { Meta } from '../config/models';
import { YamlFile, Assertion as YmlAssertion } from '../yaml';
import { Assertion, AssertionGroup, Attribute, AttributeValue, Feature, ProjectData, Tree } from './models';

export { getAttributesContext, getKey } from './keys';
export type { AssertionContext, AttributesContext } from './keys';
export type { Assertion, AssertionGroup, Attribute, AttributeValue, Feature, ProjectData, Tree } from './models';

const mapAssertion = ({ assert: title, description }: YmlAssertion): Assertion => ({
  title,
  description,
  automationState: 'Unknown',
});

const mapGroup = ([title, list]: [string, YmlAssertion[]]): AssertionGroup => {
  const assertions = list.map(mapAssertion);

  return { title, assertions };
};

const parseDependencies = (title: string, description: string | undefined, groups: AssertionGroup[]): string[] => {
  const references: ParsedValue[] = [];

  references.push(...parse(title).meta.references);
  references.push(...parse(description || '').meta.references);

  for (const group of groups) {
    for (const assertion of group.assertions) {
      references.push(...parse(assertion.title).meta.references);
      references.push(...parse(assertion.description || '').meta.references);
    }
  }

  const dependencies = new Set<string>(references.map((r) => r.value.trim().toLowerCase()));

  return Array.from(dependencies);
};

const mapFeature = ({ content, fileName, filePath }: YamlFile): Feature => {
  const { code, type, feature: title, description, definitions: attributes, 'specs-unit': specs = {} } = content;

  const groups = Object.entries(specs).map(mapGroup);

  const dependencies = parseDependencies(title, description, groups);

  return { code, type, title, description, groups, attributes, fileName, filePath, dependencies };
};

const mapAttributeValue = ({ code, title }: CfgAttributeValue): AttributeValue => ({ code, title });

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

export const processYamlFiles = (files: YamlFile[], config: { filePath: string; meta: Meta }): ProjectData => {
  const features = files.map(mapFeature);
  const attributes = config.meta.attributes?.map(mapAttribute);
  const trees = config.meta.trees?.map(mapTree);
  const metaFilePath = config.filePath;

  return { features, attributes, trees, metaFilePath };
};
