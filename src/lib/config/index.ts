import {
  readTextFile,
  parseObject,
  CWD,
  readYaml,
  readYamlIfExists,
} from "../utils";
import { ValidationError } from "../validators";
import { Meta, RootConfig, configDecoder, metaDecoder } from "./models";

export type { YmlConfig, Attribute, AttributeValue, Tree } from "./models";

export const DEFAULT_CONFIG_PATH = ".tms.json";
export const DEFAULT_META_PATH = ".spec-box-meta.yml";

export const loadConfig = async (
  path = DEFAULT_CONFIG_PATH
): Promise<RootConfig> => {
  const json = await readTextFile(path);
  const data = JSON.parse(json);

  const config = parseObject(data, configDecoder);

  return config;
};

export const loadMeta = async (
  path?: string,
  basePath: string = CWD // TODO: перенести в resolvePath
): Promise<Meta> => {
  if (path) {
    return await readYaml(metaDecoder, path, basePath);
  } else {
    const content = await readYamlIfExists(
      metaDecoder,
      DEFAULT_META_PATH,
      basePath
    );

    return content || {};
  }
};

export const validateMeta = (meta: Meta): ValidationError[] => {
  if(meta.attributes) {



  }  


  return [];
}
