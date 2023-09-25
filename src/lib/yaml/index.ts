import { basename, relative } from "node:path";

import { resolvePath, CWD, readYaml } from "../utils";
import { entityDecoder, Entity } from "./models";

export type { Entity, Assertion } from "./models";

export interface YamlFile {
  content: Entity;
  fileName: string;
  filePath: string;
}

export const loadYaml = async (
  path: string,
  basePath: string = CWD // TODO: перенести в resolvePath
): Promise<YamlFile> => {
  const absolutePath = resolvePath(path, basePath);
  const relativePath = relative(basePath, absolutePath);
  const fileName = basename(relativePath).split(".")[0];

  const content = await readYaml(entityDecoder, path, basePath);

  return {
    content,
    filePath: relativePath,
    fileName,
  };
};
