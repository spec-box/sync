import {
  readTextFile,
  parseObject,
  CWD,
  readYaml,
  readYamlIfExists,
} from '../utils';
import { Validator, printError } from '../validators';
import { getLoaderError } from '../validators/validator';
import { Meta, RootConfig, configDecoder, metaDecoder } from './models';

export type { YmlConfig, Attribute, AttributeValue, Tree } from './models';

export const DEFAULT_CONFIG_PATH = '.tms.json';
export const DEFAULT_META_PATH = '.spec-box-meta.yml';

export const loadConfig = async (
  path = DEFAULT_CONFIG_PATH
): Promise<RootConfig> => {
  const json = await readTextFile(path);
  const data = JSON.parse(json);

  const config = parseObject(data, configDecoder);

  return config;
};

export const loadMeta = async (
  validationContext: Validator,
  path?: string,
  basePath: string = CWD // TODO: перенести в resolvePath
): Promise<{ filePath: string; meta: Meta }> => {
  const filePath = path || DEFAULT_META_PATH;
  let fileReader = path
    ? readYaml(metaDecoder, filePath, basePath)
    : readYamlIfExists(metaDecoder, filePath, basePath);

  try {
    const content = await fileReader;
    const meta = content || {};

    return { filePath, meta };
  } catch (error) {
    printError(getLoaderError(error, filePath, 'config'));
    throw Error('Ошибка загрузки файла конфигурации');
  }
};
