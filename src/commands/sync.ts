import { CommandModule } from 'yargs';
import glob from 'fast-glob';

import { YamlFile, loadYaml } from '../lib/yaml';
import { loadConfig, loadMeta } from '../lib/config';
import { processYamlFiles } from '../lib/domain';
import { applyJestReport, loadJestReport } from '../lib/jest';
import { uploadEntities } from '../lib/upload/upload-entities';
import { CommonOptions } from '../lib/utils';
import { Validator } from '../lib/validators';
import { loadStorybookIndex, applyStorybookIndex } from '../lib/storybook';
import { applyTestplaneReport, loadTestplaneReport } from '../lib/testplane';

export interface SyncOptions extends CommonOptions {
  message?: string;
}

export const cmdSync: CommandModule<{}, SyncOptions> = {
  command: 'sync',
  handler: async (args) => {
    console.log('SYNC');
    const { yml, api, jest, storybook, testplane, validation = {}, projectPath } = await loadConfig(args.config);
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

    if (storybook) {
      const storybookIndex = await loadStorybookIndex(storybook.indexPath, projectPath);

      applyStorybookIndex(validationContext, projectData, storybookIndex, storybook);
    }

    if (testplane) {
      const testplaneReport = await loadTestplaneReport(testplane.reportPath, projectPath);

      applyTestplaneReport(validationContext, projectData, testplaneReport, testplane.keys);
    }

    validationContext.printReport();
    if (validationContext.hasCriticalErrors) {
      throw Error('Выгрузка невозможна из-за наличия критических ошибок');
    }

    await uploadEntities(projectData, api, args.message);
  },
};
