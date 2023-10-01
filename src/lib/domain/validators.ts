import { feature } from '../../api/models/parameters';
import { AttributeValuesMap } from '../config';
import {
  CODE_REGEX,
  FeatureCodeDuplicateError,
  FeatureCodeError,
  FeatureMissingAttributeError,
  FeatureMissingAttributeValueError,
  ValidationError,
} from '../validators';
import { Feature } from './models';

export const validateFeatures = (
  features: Feature[],
  attributeValuesMap: AttributeValuesMap
): ValidationError[] => {
  const errors = new Array<ValidationError>();
  const featureCodesUnique = new Map<string, Feature>();
  for (const feature of features) {
    const existingFeature = featureCodesUnique.get(feature.code);
    if (existingFeature) {
      const featureCodeDuplicateError: FeatureCodeDuplicateError = {
        type: 'feature-code-duplicate',
        code: feature.code,
        feature,
        firstFeature: existingFeature,
      };
      errors.push(featureCodeDuplicateError);
    } else {
      featureCodesUnique.set(feature.code, feature);
    }
    errors.push(...validateFeature(feature, attributeValuesMap));
  }
  return errors;
};

const validateFeature = (
  feature: Feature,
  attributeValuesMap: AttributeValuesMap
): ValidationError[] => {
  const errors = new Array<ValidationError>();
  if (feature.code) {
    if (!CODE_REGEX.test(feature.code)) {
      const featureCodeError: FeatureCodeError = {
        type: 'featrue-code-format-error',
        code: feature.code,
        feature,
      };
      errors.push(featureCodeError);
    }
  }

  if (feature.attributes) {
    for (const attribute in feature.attributes) {
      if (feature.hasOwnProperty(attribute)) {
        let valuesSet = attributeValuesMap.get(attribute);
        if (!valuesSet) {
          const missingAttribute: FeatureMissingAttributeError = {
            type: 'feature-missing-attribute',
            attributeCode: attribute,
            feature,
          };
          errors.push(missingAttribute);
          continue;
        }
        for (const attributeValue of feature.attributes[attribute]) {
          if (valuesSet.has(attributeValue)) {
            const missingAttributeValue: FeatureMissingAttributeValueError = {
              type: 'feature-missing-attribute-value',
              attribute,
              attributeValue,
              feature,
            };
            errors.push(missingAttributeValue);
          }
        }
      }
    }
  }

  return errors;
};
