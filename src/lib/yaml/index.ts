import { parse } from "yaml";
import { basename, relative } from "node:path";

import { readTextFile, parseObject, resolvePath, CWD } from "../utils";
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

  const content = await readTextFile(path, basePath);
  const data: unknown = parse(content);

  const entity = parseObject(data, entityDecoder);

  return {
    content: entity,
    filePath: relativePath,
    fileName,
  };
};
