import glob from 'fast-glob';
import { CommandModule } from 'yargs';

import { loadConfig, loadMeta, validateMeta } from '../lib/config';
import { processYamlFiles } from '../lib/domain';
import { validateFeatures } from '../lib/domain/validators';
import { CommonOptions } from '../lib/utils';
import { loadYaml } from '../lib/yaml';

export const cmdValidateOnly: CommandModule<{}, CommonOptions> = {
  command: 'validate',
  handler: async (args) => {
    console.log('VALIDATION');

    const { yml, jest, projectPath } = await loadConfig(args.config);

    const meta = await loadMeta(yml.metaPath, projectPath);

    const metaValidation = validateMeta(meta);

    // Возможно не продолжать валидацию, если есть ошибки валидации в Meta

    const files = await glob(yml.files, { cwd: projectPath });

    const yamls = await Promise.all(
      files.map((path) => loadYaml(path, projectPath))
    );

    const projectData = processYamlFiles(yamls, meta);

    const featureValidation = validateFeatures(
      projectData.features,
      metaValidation.attributeValuesMap
    );

    console.log(metaValidation);
    console.log(featureValidation);
  },
};
