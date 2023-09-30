import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { cmdSync } from "./commands/sync";
import { cmdUploadStat } from "./commands/upload-stat";
import { cmdValidateOnly } from "./commands/validate-only";

yargs(hideBin(process.argv))
  .command(cmdSync)
  .command(cmdUploadStat)
  .command(cmdValidateOnly)
  .option("config", {
    alias: "c",
    type: "string",
    description: "config path",
  })
  .parse();
