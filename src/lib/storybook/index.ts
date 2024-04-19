// TODO: надо вынести в отдельный пакет и импоритовать зависимости из @spec-box/sync
import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
import { AutomationState } from '../domain/models';
import { SpecBox } from '../pluginsLoader';
import { parseObject, readTextFile } from '../utils';
import { Validator } from '../validators';

import { StorybookConfig, StorybookIndex, storybookConfigDecoder, storybookIndexDecoder } from './models';

export const getFullName = (...parts: string[]) => parts.join(' / ');

export default async (specbox: SpecBox, opts: unknown) => {
  const storybook = parseObject(opts, storybookConfigDecoder);
  const index = await loadStorybookIndex(storybook.indexPath, specbox.projectPath);

  applyStorybookIndex(specbox.validationContext, specbox.projectData, index, storybook);
};

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
    const fullName = getFullName(
      title
        .split('/')
        .map((part) => part.trim())
        .join(' / '),
      name,
    );

    automatedAssertions.add(fullName);

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

        if (automatedAssertions.has(fullName)) {
          assertion.automationState = 'Automated';
        }

        names.delete(fullName);
      }
    }
  }

  for (const [name, path] of names.entries()) {
    validationContext.registerPluginError(
      'storybook',
      ({ val }) => `Обнаружена история без описания\n${val(name)}`,
      path,
    );
  }
};

export const loadStorybookIndex = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, storybookIndexDecoder);

  return entity;
};
