import { CommandModule } from 'yargs';
import { glob } from 'fast-glob';

import { YamlFile, loadYaml } from '../lib/yaml';
import { loadConfig, loadMeta } from '../lib/config';
import { processYamlFiles } from '../lib/domain';
import { applyJestReport, loadJestReport } from '../lib/jest';
import { CommonOptions } from '../lib/utils';
import { Validator } from '../lib/validators';
import { applyStorybookIndex, loadStorybookIndex } from '../lib/storybook';
import { applyTestplaneReport, loadTestplaneReport } from '../lib/testplane';
import { applyPlaywrightReport, loadPlaywrightReport } from '../lib/playwright';

export const cmdValidateOnly: CommandModule<{}, CommonOptions> = {
  command: 'validate',
  handler: async (args) => {
    console.log('VALIDATION');

    const { yml, jest, storybook, testplane, playwright, validation = {}, projectPath } = await loadConfig(args.config);
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

    if (playwright) {
      const playwrightReport = await loadPlaywrightReport(playwright.reportPath, projectPath);

      applyPlaywrightReport(validationContext, projectData, playwrightReport, playwright.keys);
    }

    validationContext.printReport();
    if (validationContext.hasCriticalErrors) {
      throw Error('При валидации были обнаружены критические ошибки');
    }
  },
};
