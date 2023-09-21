import { readTextFile, parseObject } from "../utils";
import { RootConfig, configDecoder } from "./models";

export type { YmlConfig, Attribute, AttributeValue, Tree } from './models';

export const DEFAULT_CONFIG_PATH = ".tms.json";

export const loadConfig = async (
  path = DEFAULT_CONFIG_PATH
): Promise<RootConfig> => {
  const json = await readTextFile(path);
  const data = JSON.parse(json);

  const config = parseObject(data, configDecoder);

  return config;
};
