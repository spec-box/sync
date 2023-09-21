import { AssertionContext, ProjectData, getAttributesContext, getKey } from "../domain";
import { readTextFile, parseObject } from "../utils";
import { JestReport, jestReportDecoder } from "./models";

export const getFullName = (...parts: string[]) => parts.join(" / ");

export const applyJestReport = (
  { features, attributes }: ProjectData,
  report: JestReport,
  keyParts: string[]
) => {
  const names = new Set<string>();

  // формируем список ключей тест-кейсов из отчета jest
  for (let { assertionResults } of report.testResults) {
    for (let { title, ancestorTitles } of assertionResults) {
      names.add(getFullName(...ancestorTitles, title));
    }
  }

  const attributesCtx = getAttributesContext(attributes);

  // заполняем поле isAutomated
  for (let {
    title: featureTitle,
    code: featureCode,
    groups,
    fileName,
    filePath,
    attributes = {},
  } of features) {
    for (let { title: groupTitle, assertions } of groups || []) {
      for (let assertion of assertions || []) {
        // TODO: перенести в domain?
        const assertionCtx: AssertionContext = {
          featureTitle,
          featureCode,
          groupTitle,
          assertionTitle: assertion.title,
          attributes,
          fileName,
          filePath,
        };

        const parts = getKey(keyParts, assertionCtx, attributesCtx);
        const fullName = getFullName(...parts);

        console.log("process:  \x1b[36m%s\x1b[0m", fullName);

        assertion.isAutomated = names.has(fullName);

        names.delete(fullName);
      }
    }
  }
};

export const loadJestReport = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, jestReportDecoder);

  return entity;
};
