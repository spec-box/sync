import { Attribute } from "./models";

export const UNDEFINED = "UNDEFINED";
export const AMBIGUOUS = "AMBIGUOUS";

export type AttributesContext = Record<string, Record<string, string>>;

export interface AssertionContext {
  featureTitle: string;
  featureCode: string;
  groupTitle: string;
  assertionTitle: string;
  fileName: string;
  filePath: string;
  attributes: Record<string, string[]>;
}

export const getAttributesContext = (
  alLAttributes: Attribute[] = []
): AttributesContext => {
  const obj: AttributesContext = {};

  for (let { code, values } of alLAttributes) {
    // TODO: валидация дубликатов
    const attr: Record<string, string> = (obj[code] = {});

    for (let { code, title } of values) {
      attr[code] = title;
    }
  }

  return obj;
};

const getAttributeValue = (
  attributeCode: string,
  { attributes }: AssertionContext,
  allAttributes: AttributesContext
): { title: string; code: string } | undefined => {
  const values = attributes[attributeCode] || [];

  switch (values.length) {
    case 0:
      return undefined;
    case 1:
      const [code] = values;
      const title = allAttributes[attributeCode]?.[code] || code;

      return { code, title };
    default:
      return { code: AMBIGUOUS, title: AMBIGUOUS };
  }
};

export const getKeyPart = (
  value: string,
  assertion: AssertionContext,
  attributes: AttributesContext
): string => {
  if (value.startsWith("$")) {
    const attributeCode = value.replace(/^[$]/, "");
    return (
      getAttributeValue(attributeCode, assertion, attributes)?.title ||
      UNDEFINED
    );
  } else if (value.startsWith("@")) {
    const attributeCode = value.replace(/^@/, "");
    return (
      getAttributeValue(attributeCode, assertion, attributes)?.code || UNDEFINED
    );
  }

  switch (value) {
    case "featureTitle":
      return assertion.featureTitle;
    case "featureCode":
      return assertion.featureCode;
    case "groupTitle":
      return assertion.groupTitle;
    case "assertionTitle":
      return assertion.assertionTitle;
    case "fileName":
      return assertion.fileName;
    case "filePath":
      return assertion.filePath;
    default:
      return UNDEFINED;
  }
};

export const getKey = (
  parts: string[],
  assertion: AssertionContext,
  attributes: AttributesContext
) => parts.map((str) => getKeyPart(str, assertion, attributes));
