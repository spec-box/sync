import { CommandModule } from "yargs";
import glob from "fast-glob";

import { CommonOptions } from "../lib/utils";
import { loadConfig, loadMeta } from "../lib/config";
import { loadYaml } from "../lib/yaml";
import { uploadEntities } from "../lib/upload/upload-entities";
import { applyJestReport, loadJestReport } from "../lib/jest";
import { processYamlFiles } from "../lib/domain";

export const cmdSync: CommandModule<{}, CommonOptions> = {
  command: "sync",
  handler: async (args) => {
    console.log("SYNC");

    const { yml, api, jest, projectPath } = await loadConfig(args.config);

    const meta = await loadMeta(yml.metaPath, projectPath);
    const files = await glob(yml.files, { cwd: projectPath });

    const yamls = await Promise.all(
      files.map((path) => loadYaml(path, projectPath))
    );

    const projectData = processYamlFiles(yamls, meta);

    if (jest) {
      const jestReport = await loadJestReport(jest.reportPath, projectPath);

      applyJestReport(projectData, jestReport, jest.keys);
    }

    await uploadEntities(projectData, api);
  },
};
