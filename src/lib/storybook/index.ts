import { StorybookConfig } from '../config/models';
import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
import { parseObject, readTextFile } from '../utils';
import { Validator } from '../validators';
import { StorybookIndex, storybookIndexDecoder } from './models';

export const getFullName = (...parts: string[]) => parts.join(' / ');

export const applyStorybookIndex = (
  validationContext: Validator,
  { features, attributes }: ProjectData,
  index: StorybookIndex,
  storybook: StorybookConfig,
) => {
  const names = new Map<string, string>();

  const automatedAssertions = new Set<string>();

  // формируем список ключей сторей из конфига storybook
  for (let { title, name, importPath } of Object.values(index.entries)) {
    const parts = title.split('/').map((part) => part.trim());
    const fullName = getFullName(...parts, name);

    automatedAssertions.add(fullName);

    names.set(fullName, importPath);
  }

  const attributesCtx = getAttributesContext(attributes);

  // заполняем поле automationState
  for (let feature of features) {
    for (let group of feature.groups || []) {
      for (let assertion of group.assertions || []) {
        const assertionCtx = getAssertionContext(feature, group, assertion);

        const parts = getKey(storybook.keys, assertionCtx, attributesCtx);
        const fullName = getFullName(...parts);

        if (automatedAssertions.has(fullName)) {
          assertion.automationState = 'Automated';
        }

        names.delete(fullName);
      }
    }
  }

  for (const [name, path] of names.entries()) {
    validationContext.registerStorybookUnusedStory(name, path);
  }
};

export const loadStorybookIndex = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, storybookIndexDecoder);

  return entity;
};
