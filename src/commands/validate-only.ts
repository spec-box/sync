import { CommandModule } from 'yargs';
import { glob } from 'fast-glob';

import { YamlFile, loadYaml } from '../lib/yaml';
import { loadConfig, loadMeta } from '../lib/config';
import { processYamlFiles } from '../lib/domain';
import { applyJestReport, loadJestReport } from '../lib/jest';
import { CommonOptions } from '../lib/utils';
import { Validator } from '../lib/validators';
import { applyPlugins } from '../lib/pluginsLoader';

export const cmdValidateOnly: CommandModule<{}, CommonOptions> = {
  command: 'validate',
  handler: async (args) => {
    console.log('VALIDATION');

    const { yml, jest, plugins, validation = {}, projectPath } = await loadConfig(args.config);
    const validationContext = new Validator(validation);
    const meta = await loadMeta(validationContext, yml.metaPath, projectPath);

    const files = await glob(yml.files, { cwd: projectPath });

    const yamls = await Promise.all(files.map((path) => loadYaml(validationContext, path, projectPath)));
    const successYamls = new Array<YamlFile>();
    yamls.forEach((yaml) => yaml && successYamls.push(yaml));

    const projectData = processYamlFiles(successYamls, meta);

    validationContext.validate(projectData);

    if (jest) {
      const jestReport = await loadJestReport(jest.reportPath, projectPath);

      applyJestReport(validationContext, projectData, jestReport, jest.keys);
    }

    if (plugins) {
      await applyPlugins({ projectData, validationContext }, plugins);
    }

    validationContext.printReport();
    if (validationContext.hasCriticalErrors) {
      throw Error('При валидации были обнаружены критические ошибки');
    }
  },
};
