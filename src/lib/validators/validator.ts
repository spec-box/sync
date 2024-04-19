import { Attribute, ValidationConfig, ValidationSeverity } from '../config/models';
import { Feature, ProjectData } from '../domain';
import { Tree } from '../domain/models';
import {
  AssertionDuplicateError,
  AttributeDuplicateError,
  AttributeValueDuplicateError,
  CodeError,
  DEFAULT_ERROR_SEVERITY,
  FeatureAttributeValueCodeError,
  FeatureCodeDuplicateError,
  FeatureCodeError,
  FeatureMissingAttributeError,
  FeatureMissingLinkError,
  JestUnusedTestError,
  LoaderError,
  StorybookUnusedStoryError as PluginError,
  TreeAttributeDuplicateError,
  TreeDuplicateError,
  TreeMissingAttributeError,
  ValidationError,
} from './models';
import { printError, renderStats } from './renderer';

const CODE_REGEX = /^[A-Za-z][A-Za-z0-9-_]*$/;

export class Validator {
  private readonly loaderErrors = new Array<ValidationError>();
  private readonly metaErrors = new Array<ValidationError>();
  private readonly featureErrors = new Array<ValidationError>();
  private readonly jestUnusedTests = new Array<JestUnusedTestError>();
  private readonly pluginsErrors = new Array<PluginError>();
  private metaFilePath = '';

  public readonly severity: Record<string, ValidationSeverity>;

  constructor(config: ValidationConfig) {
    this.severity = { ...DEFAULT_ERROR_SEVERITY, ...config };
  }

  get hasCriticalErrors(): boolean {
    return [
      ...this.loaderErrors,
      ...this.metaErrors,
      ...this.featureErrors,
      ...this.jestUnusedTests,
      ...this.pluginsErrors,
    ].some((e) => this.severity[e.type] === 'error');
  }

  printReport() {
    const render = (e: ValidationError) => printError(e, this.severity);

    this.jestUnusedTests.forEach(render);
    this.pluginsErrors.forEach(render);
    this.featureErrors.forEach(render);
    this.metaErrors.forEach(render);
    this.loaderErrors.forEach(render);

    renderStats(
      'Всего',
      [...this.loaderErrors, ...this.metaErrors, ...this.featureErrors, ...this.jestUnusedTests, ...this.pluginsErrors],
      this.severity,
    );
  }

  registerLoaderError(error: unknown, filePath: string, fileType: LoaderError['fileType']) {
    this.loaderErrors.push(getLoaderError(error, filePath, fileType));
  }

  registerJestUnusedTests(test: string, filePath: string) {
    this.jestUnusedTests.push({
      type: 'jest-unused',
      test,
      filePath,
    });
  }

  registerPluginError(pluginName: string, error: PluginError['error'], filePath: string) {
    this.pluginsErrors.push({
      type: 'plugin-error',
      pluginName,
      error,
      filePath,
    });
  }

  validate({ trees, attributes, metaFilePath, features }: ProjectData) {
    const metaAttributeValues = new Map<string, Set<string>>();

    this.metaFilePath = metaFilePath;
    this.validateMetaAttributes(attributes, metaAttributeValues);
    this.validateMetaTrees(trees, metaAttributeValues);
    this.validateFeatures(features, metaAttributeValues);
  }

  private validateMetaAttributes(attributes: Attribute[] | undefined, attributeValuesMap: Map<string, Set<string>>) {
    const filePath = this.metaFilePath;

    if (attributes) {
      for (const attribute of attributes) {
        const codeValidation = this.validateCode(attribute.code, filePath);
        if (codeValidation) {
          this.metaErrors.push(codeValidation);
          continue;
        }
        if (attributeValuesMap.has(attribute.code)) {
          const error: AttributeDuplicateError = {
            type: 'attribute-duplicate',
            attribute,
            filePath,
          };
          this.metaErrors.push(error);
          continue;
        }

        const attributeValuesUnique = new Set<string>();
        attributeValuesMap.set(attribute.code, attributeValuesUnique);

        this.metaErrors.push(...this.validateMetaAttributeValues(attribute, attributeValuesUnique, filePath));
      }
    }
  }

  private validateMetaAttributeValues(
    attribute: Attribute,
    attributeValuesUnique: Set<string>,
    filePath: string,
  ): ValidationError[] {
    const result = new Array<ValidationError>();
    for (const attributeValue of attribute.values) {
      const valueValidation = this.validateCode(attributeValue.code, filePath);

      if (valueValidation) {
        result.push(valueValidation);
        continue;
      }
      if (attributeValuesUnique.has(attributeValue.code)) {
        const error: AttributeValueDuplicateError = {
          type: 'attribute-value-duplicate',
          attribute,
          attributeValue,
          filePath,
        };
        result.push(error);
        continue;
      }
      attributeValuesUnique.add(attributeValue.code);
    }
    return result;
  }

  private validateMetaTrees(trees: Tree[] | undefined, attributeValuesMap: Map<string, Set<string>>) {
    const filePath = this.metaFilePath;
    if (trees) {
      const treeUnique = new Set<string>();

      for (const tree of trees) {
        const codeValidation = this.validateCode(tree.code, filePath);
        if (codeValidation) {
          this.metaErrors.push(codeValidation);
          continue;
        }

        if (treeUnique.has(tree.code)) {
          const error: TreeDuplicateError = {
            type: 'tree-duplicate',
            tree,
            filePath,
          };
          this.metaErrors.push(error);
          continue;
        }
        treeUnique.add(tree.code);

        const treeAttributesUnique = new Set<string>();
        for (const attribute of tree.attributes) {
          if (!attributeValuesMap.has(attribute)) {
            const missingAttribute: TreeMissingAttributeError = {
              type: 'tree-missing-attribute',
              attributeCode: attribute,
              tree,
              filePath,
            };
            this.metaErrors.push(missingAttribute);
          }
          if (treeAttributesUnique.has(attribute)) {
            const attributeDuplicate: TreeAttributeDuplicateError = {
              type: 'tree-attribute-duplicate',
              attributeCode: attribute,
              tree,
              filePath,
            };
            this.metaErrors.push(attributeDuplicate);
          }
          treeAttributesUnique.add(attribute);
        }
      }
    }
  }

  private validateFeatures(features: Feature[], metaAttributeValues: Map<string, Set<string>>) {
    const featuresMap = new Map<string, Feature>();
    for (const feature of features) {
      const existingFeature = featuresMap.get(feature.code);
      if (existingFeature) {
        const featureCodeDuplicateError: FeatureCodeDuplicateError = {
          type: 'feature-code-duplicate',
          filePath: feature.filePath,
          code: feature.code,
          feature,
          firstFeature: existingFeature,
        };
        this.featureErrors.push(featureCodeDuplicateError);
      } else {
        featuresMap.set(feature.code, feature);
      }
      this.featureErrors.push(...this.validateFeature(feature, metaAttributeValues));
    }
    this.validateFeatureLinks(features, featuresMap);
  }

  private validateFeature(feature: Feature, metaAttributeValues: Map<string, Set<string>>): ValidationError[] {
    const errors = new Array<ValidationError>();
    if (feature.code) {
      if (!CODE_REGEX.test(feature.code)) {
        const featureCodeError: FeatureCodeError = {
          type: 'featrue-code-format',
          filePath: feature.filePath,
          code: feature.code,
          feature,
        };
        errors.push(featureCodeError);
      }
    }

    if (feature.attributes) {
      for (const attribute in feature.attributes) {
        let valuesSet = metaAttributeValues.get(attribute);
        if (!valuesSet) {
          const missingAttribute: FeatureMissingAttributeError = {
            type: 'feature-missing-attribute',
            filePath: feature.filePath,
            attributeCode: attribute,
            feature,
          };
          errors.push(missingAttribute);
        }
        for (const attributeValue of feature.attributes[attribute]) {
          if (!CODE_REGEX.test(attributeValue)) {
            const attributeCodeError: FeatureAttributeValueCodeError = {
              type: 'featrue-attribute-value-code-format',
              filePath: feature.filePath,
              attribute,
              feature,
              code: attributeValue,
            };
            errors.push(attributeCodeError);
          }
        }
      }
    }
    errors.push(...this.validateAsserions(feature));

    return errors;
  }
  private validateAsserions(feature: Feature): ValidationError[] {
    const errors = new Array<ValidationError>();

    for (const assertionGroup of feature.groups) {
      const assertionsUnique = new Set<string>();
      for (const assertion of assertionGroup.assertions) {
        if (assertionsUnique.has(assertion.title)) {
          const assertionDuplicateError: AssertionDuplicateError = {
            type: 'assertion-duplicate',
            filePath: feature.filePath,
            feature,
            assertionGroup,
            assertion,
          };
          errors.push(assertionDuplicateError);
        }
        assertionsUnique.add(assertion.title);
      }
    }
    return errors;
  }

  private validateFeatureLinks(features: Feature[], featuresMap: Map<string, Feature>) {
    for (const feature of features) {
      this.featureErrors.push(...this.validateLinks(feature, featuresMap));
    }
  }

  private validateLinks(feature: Feature, featuresMap: Map<string, Feature>): FeatureMissingLinkError[] {
    const errors = new Array<FeatureMissingLinkError>();

    if (feature.dependencies) {
      for (const link of feature.dependencies) {
        if (!featuresMap.has(link)) {
          const linkError: FeatureMissingLinkError = {
            type: 'feature-missing-link',
            filePath: feature.filePath,
            feature,
            link,
          };
          errors.push(linkError);
        }
      }
    }

    return errors;
  }

  private validateCode(value: string, filePath: string): CodeError | undefined {
    if (!CODE_REGEX.test(value)) {
      return { type: 'code-format-error', code: value, filePath };
    }
  }
}

export const getLoaderError = (error: unknown, filePath: string, fileType: LoaderError['fileType']): LoaderError => {
  let description = 'Unknown error';
  if (typeof error === 'string') {
    description = error;
  } else if (error instanceof Error) {
    description = error.message;
  }
  const loaderError: LoaderError = {
    type: 'loader-error',
    description,
    filePath,
    fileType,
  };
  return loaderError;
};
