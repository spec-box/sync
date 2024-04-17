import { StorybookConfig } from '../config/models';
import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
import { AutomationState } from '../domain/models';
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

  const state = new Map<string, AutomationState>();

  // формируем список ключей сторей из конфига storybook
  for (let { title, name, importPath } of Object.values(index.entries)) {
    const fullName = getFullName(title.split('/').join(' / '), name);

    state.set(fullName, 'Automated');
    names.set(fullName, importPath);
  }

  const attributesCtx = getAttributesContext(attributes);

  // заполняем поле isAutomated
  for (let feature of features) {
    for (let group of feature.groups || []) {
      for (let assertion of group.assertions || []) {
        const assertionCtx = getAssertionContext(feature, group, assertion);

        const parts = getKey(storybook.keys, assertionCtx, attributesCtx);
        const fullName = getFullName(...parts);

        const automationState = state.get(fullName);
        if (automationState) {
          assertion.automationState = automationState;
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
