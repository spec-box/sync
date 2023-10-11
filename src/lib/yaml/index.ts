import { basename, relative } from 'node:path';

import { resolvePath, CWD, readYaml } from '../utils';
import { entityDecoder, Entity } from './models';
import { Validator } from '../validators';

export type { Entity, Assertion } from './models';

export interface YamlFile {
  content: Entity;
  fileName: string;
  filePath: string;
}

export const loadYaml = async (
  validationContext: Validator,
  path: string,
  basePath: string = CWD, // TODO: перенести в resolvePath
): Promise<YamlFile | undefined> => {
  const absolutePath = resolvePath(path, basePath);
  const relativePath = relative(basePath, absolutePath);
  const fileName = basename(relativePath).split('.')[0];

  try {
    const content = await readYaml(entityDecoder, path, basePath);
    return {
      content,
      filePath: relativePath,
      fileName,
    };
  } catch (error) {
    if (validationContext) {
      validationContext.registerLoaderError(error, relativePath, 'feature');
    } else {
      throw error;
    }
  }
};
