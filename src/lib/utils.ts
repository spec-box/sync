import { resolve } from "node:path";
import { readFile } from "fs-extra";
import * as d from "io-ts/Decoder";
import { isLeft } from "fp-ts/lib/Either";

export interface CommonOptions {
  config?: string;
}

export const CWD = process.cwd();

export const resolvePath = (path: string, basePath = CWD) => resolve(basePath, path);

export const readTextFile = async (path: string, basePath?: string) => {
  const resolvedPath = resolvePath(path, basePath);
  const content = await readFile(resolvedPath);

  return content.toString();
};

export const parseObject = <T>(data: unknown, decoder: d.Decoder<unknown, T>): T => {
  const result = decoder.decode(data);
  if (isLeft(result)) {
    const errorDescription = d.draw(result.left);
    throw new Error(errorDescription);
  }

  return result.right;
};
