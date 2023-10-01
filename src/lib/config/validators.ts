import {
  AttributeDuplicateError,
  AttributeValueDuplicateError,
  TreeAttributeDuplicateError,
  TreeDuplicateError,
  TreeMissingAttributeError,
  ValidationError,
  validateCode
} from "../validators";
import { Attribute, Meta } from "./models";

export type AttributeValuesMap = Map<string, Set<string>>;

export const validateMeta = (
  meta: Meta
): {
  errors: ValidationError[];
  attributeValuesMap: AttributeValuesMap;
} => {
  const errors = new Array<ValidationError>();
  const attributeValuesMap = new Map<string, Set<string>>();
  if (meta.attributes) {
    for (const attribute of meta.attributes) {
      const codeValidation = validateCode(attribute.code);
      if (codeValidation) {
        errors.push(codeValidation);
        continue;
      }
      if (attributeValuesMap.has(attribute.code)) {
        const error: AttributeDuplicateError = {
          type: "attribute-duplicate",
          attribute,
        };
        errors.push(error);
        continue;
      }

      const attributeValuesUnique = new Set<string>();
      attributeValuesMap.set(attribute.code, attributeValuesUnique);

      errors.push(...validateAttributeValues(attribute, attributeValuesUnique));
    }
    if (meta.trees) {
      for (const tree of meta.trees) {
        const treeUnique = new Set<string>();
        const codeValidation = validateCode(tree.code);
        if (codeValidation) {
          errors.push(codeValidation);
          continue;
        }
        if (treeUnique.has(tree.code)) {
          const error: TreeDuplicateError = {
            type: "tree-duplicate",
            tree,
          };
          errors.push(error);
          continue;
        }
        treeUnique.add(tree.code);
        const treeAttributesUnique = new Set<string>();
        for(const attribute of tree["group-by"]) {
          if(!attributeValuesMap.has(attribute)) {
            const missingAttribute: TreeMissingAttributeError = {
              type: "tree-missing-attribute",
              attributeCode: attribute,
              tree
            };
            errors.push(missingAttribute);
          }
          if(treeAttributesUnique.has(attribute)) {
            const attributeDuplicate: TreeAttributeDuplicateError = {
              type: "tree-attribute-duplicate",
              attributeCode: attribute,
              tree
            };
            errors.push(attributeDuplicate)
          }
          treeAttributesUnique.add(attribute);
        }
      }
    }
  }

  return {
    errors,
    attributeValuesMap,
  };
};

function validateAttributeValues(
  attribute: Attribute,
  attributeValuesUnique: Set<string>
): ValidationError[] {
  const result = new Array<ValidationError>();
  for (const attributeValue of attribute.values) {
    const valueValidation = validateCode(attribute.code);
    if (valueValidation) {
      result.push(valueValidation);
      continue;
    }
    if (attributeValuesUnique.has(attributeValue.code)) {
      const error: AttributeValueDuplicateError = {
        type: "attribute-value-duplicate",
        attribute,
        attributeValue,
      };
      result.push(error);
      continue;
    }
    attributeValuesUnique.add(attributeValue.code);
  }
  return result;
}
