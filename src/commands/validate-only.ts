import { CommandModule } from "yargs";
import glob from "fast-glob";

import { CommonOptions } from "../lib/utils";
import { loadConfig, loadMeta, validateMeta } from "../lib/config";
import { loadYaml } from "../lib/yaml";
import { uploadEntities } from "../lib/upload/upload-entities";
import { applyJestReport, loadJestReport } from "../lib/jest";
import { processYamlFiles } from "../lib/domain";

export const cmdValidateOnly: CommandModule<{}, CommonOptions> = {
  command: "validate",
  handler: async (args) => {
    console.log("VALIDATION");

    const { yml, jest, projectPath } = await loadConfig(args.config);

    const meta = await loadMeta(yml.metaPath, projectPath);
      
    const files = await glob(yml.files, { cwd: projectPath });

    const yamls = await Promise.all(
      files.map((path) => loadYaml(path, projectPath))
    );

    
  },
};
