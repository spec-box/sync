import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { cmdSync } from "./commands/sync";
import { cmdUploadStat } from "./commands/upload-stat";

yargs(hideBin(process.argv))
  .command(cmdSync)
  .command(cmdUploadStat)
  .option("config", {
    alias: "c",
    type: "string",
    description: "config path",
  })
  .parse();
