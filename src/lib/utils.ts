import { resolve } from "node:path";
import { readFile, exists } from "fs-extra";
import * as d from "io-ts/Decoder";
import { isLeft } from "fp-ts/lib/Either";
import { parse } from "yaml";
import { SpecBoxWebApiOptionalParams } from "../api";

export const DEFAULT_API_OPTIONS: SpecBoxWebApiOptionalParams = {
  allowInsecureConnection: true,
  retryOptions: { maxRetries: 0 },
};

export interface CommonOptions {
  config?: string;
}

export const CWD = process.cwd();

export const normalizePath = (path: string) =>
  path.replace(/[\\/]+/g, "/").replace(/[/]$/g, "");

export const resolvePath = (path: string, basePath = CWD) =>
  resolve(basePath, path);
export const fileExists = (path: string, basePath = CWD) =>
  exists(resolve(basePath, path));

export const readTextFile = async (path: string, basePath?: string) => {
  const resolvedPath = resolvePath(path, basePath);
  const content = await readFile(resolvedPath);

  return content.toString();
};

export const parseObject = <T>(
  data: unknown,
  decoder: d.Decoder<unknown, T>
): T => {
  const result = decoder.decode(data);
  if (isLeft(result)) {
    const errorDescription = d.draw(result.left);
    throw new Error(errorDescription);
  }

  return result.right;
};

export const readYaml = async <T>(
  decoder: d.Decoder<unknown, T>,
  path: string,
  basePath?: string
): Promise<T> => {
  const content = await readTextFile(path, basePath);
  const data: unknown = parse(content);

  return parseObject(data, decoder);
};

export const readYamlIfExists = async <T>(
  decoder: d.Decoder<unknown, T>,
  path: string,
  basePath?: string
): Promise<T | undefined> => {
  const yamlExists = await fileExists(path, basePath);

  if (yamlExists) {
    return readYaml(decoder, path, basePath);
  }

  return undefined;
};
