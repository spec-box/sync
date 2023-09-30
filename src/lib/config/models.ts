import { pipe } from "fp-ts/lib/function";
import * as d from "io-ts/Decoder";
import {
  Validator,
  validateCode
} from "../validators";

// meta
export const attributeValueDecoder = d.struct({
  code: d.string,
  title: d.string,
});

export const attributeValueValidator = new Validator<AttributeValue>();
attributeValueValidator.register((a) => a.code, [validateCode]);

export const attributeDecoder = d.struct({
  code: d.string,
  title: d.string,
  values: d.array(attributeValueDecoder),
});

export const attributeValidator = new Validator<Attribute>();
attributeValidator.register((a) => a.code, [validateCode]);
attributeValidator.register((a) => a.values, [attributeValueValidator.validate]);


export const treeDecoder = d.struct({
  code: d.string,
  title: d.string,
  "group-by": d.array(d.string),
});

export const metaDecoder = d.partial({
  attributes: d.array(attributeDecoder),
  trees: d.array(treeDecoder),
});

// config
export const apiConfigDecoder = d.struct({
  host: d.string,
  project: d.string,
});

export const ymlConfigDecoder = d.intersect(
  d.struct({
    files: d.array(d.string),
  })
)(
  d.partial({
    metaPath: d.string,
  })
);

export const literalKeyPartDecoder = d.literal(
  "featureTitle",
  "featureCode",
  "groupTitle",
  "assertionTitle",
  "fileName",
  "filePath"
);

export const attributeKeyPartDecoder = pipe(
  d.string,
  d.parse((str) => {
    if (/^[@$]/.test(str)) {
      return d.success(str.trim());
    }

    return d.failure(str, "starts with @ or $ symbol");
  })
);

export const jestConfigDecoder = d.struct({
  reportPath: d.string,
  keys: d.array(d.union(literalKeyPartDecoder, attributeKeyPartDecoder)),
});

export const configDecoder = d.intersect(
  d.struct({
    api: apiConfigDecoder,
    yml: ymlConfigDecoder,
  })
)(
  d.partial({
    projectPath: d.string,
    jest: jestConfigDecoder,
  })
);

export type RootConfig = d.TypeOf<typeof configDecoder>;
export type ApiConfig = d.TypeOf<typeof apiConfigDecoder>;
export type YmlConfig = d.TypeOf<typeof ymlConfigDecoder>;
export type JestConfig = d.TypeOf<typeof jestConfigDecoder>;

export type Meta = d.TypeOf<typeof metaDecoder>;
export type Tree = d.TypeOf<typeof treeDecoder>;
export type Attribute = d.TypeOf<typeof attributeDecoder>;
export type AttributeValue = d.TypeOf<typeof attributeValueDecoder>;
