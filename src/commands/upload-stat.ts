import { CommandModule } from "yargs";

import { CommonOptions } from "../lib/utils";
import { loadConfig } from "../lib/config";
import { uploadJestStat } from "../lib/upload/upload-jest-stat";
import { loadJestReport } from "../lib/jest";

export const cmdUploadStat: CommandModule<{}, CommonOptions> = {
  command: "upload-stat",
  handler: async (args) => {
    console.log("Upload Jest stat");

    const { api, jest, projectPath } = await loadConfig(args.config);

    if (!jest) {
      console.log("Jest settings are not specified");
      process.exit(1);
    }

    const jestReport = await loadJestReport(jest.reportPath, projectPath);

    await uploadJestStat(jestReport, api);
  },
};
