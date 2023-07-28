import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { cmdSync } from "./commands/sync";

yargs(hideBin(process.argv))
  .command(cmdSync)
  .option("config", {
    alias: "c",
    type: "string",
    description: "config path",
  })
  .parse();
