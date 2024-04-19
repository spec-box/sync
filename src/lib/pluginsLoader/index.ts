import { ProjectData } from '../domain';
import { Validator } from '../validators';
// TODO: надо будет убрать, когда сторибук будет вынесен в отдельный пакет
import storybookPlugin from '../storybook';

export type SpecBox = {
  projectPath?: string;
  projectData: ProjectData;
  validationContext: Validator;
};

export const applyPlugins = async (specbox: SpecBox, plugins: Record<string, unknown>) => {
  for (const [name, opts] of Object.entries(plugins)) {
    await requirePlugin(name)(specbox, opts);
  }
};

const requirePlugin = (pluginName: string) => {
  // TODO: надо будет убрать, когда сторибук будет вынесен в отдельный пакет
  if (pluginName === 'storybook') {
    return storybookPlugin;
  }

  const pluginNameWithPrefix = `${PLUGIN_NAME_PREFIX}${pluginName}`;
  return require(pluginNameWithPrefix);
};

const PLUGIN_NAME_PREFIX = '@spec-box/';
