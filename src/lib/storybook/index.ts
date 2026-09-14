import { StorybookConfig } from '../config/models';
import { ProjectData, getAssertionContext, getAttributesContext, getKey } from '../domain';
import { parseObject, readTextFile } from '../utils';
import { Validator } from '../validators';
import { StorybookIndex, storybookIndexDecoder } from './models';

export const getFullName = (...parts: string[]) => parts.join(' / ');

export const normalizeUrl = (url?: string) => url?.replace(/^[\s\/]+|[\s\/]+$/g, '');

export const applyStorybookIndex = (
  validationContext: Validator,
  { features, attributes }: ProjectData,
  index: StorybookIndex,
  storybook: StorybookConfig,
) => {
  const publicUrl = normalizeUrl(storybook.publicUrl);

  const buildDetailsUrl = publicUrl
    ? (id: string) => `${publicUrl}/iframe.html?viewMode=story&id=${id}`
    : () => undefined;

  const automatedAssertions = new Map<string, { importPath: string; detailsUrl?: string }>();

  // полное имя истории -> пути ко всем файлам с таким именем.
  // отдельная структура нужна потому, что automatedAssertions выше — это Map, и стори
  // с совпадающим именем в ней затирают друг друга. затирание оставлено намеренно:
  // на нем держится отчет о историях без описания, где одинаковые стори дают одну запись.
  // здесь же они нужны все до единой, иначе валидатор не увидит дубликат
  const importPaths = new Map<string, string[]>();

  // формируем список ключей сторей из конфига storybook
  for (let { id, title, name, importPath } of Object.values(index.entries)) {
    const parts = title.split('/').map((part) => part.trim());
    const fullName = getFullName(...parts, name);
    const detailsUrl = buildDetailsUrl(id);

    automatedAssertions.set(fullName, { importPath, detailsUrl });

    // накапливаем путь, а не перезаписываем: количество путей — это количество стори с таким именем
    const pathes = importPaths.get(fullName) || [];
    pathes.push(importPath);
    importPaths.set(fullName, pathes);
  }

  const attributesCtx = getAttributesContext(attributes);

  // заполняем поле automationState
  for (let feature of features) {
    for (let group of feature.groups || []) {
      for (let assertion of group.assertions || []) {
        const assertionCtx = getAssertionContext(feature, group, assertion);

        const parts = getKey(storybook.keys, assertionCtx, attributesCtx);
        const fullName = getFullName(...parts);

        if (automatedAssertions.has(fullName)) {
          assertion.automationState = 'Automated';
          assertion.detailsUrl = automatedAssertions.get(fullName)?.detailsUrl;
        }

        // складываем в модель все истории с таким именем.
        // если историй больше одной, валидатор сообщит о дубликате;
        // если ни одной, ФТ останется без сопоставленных тестов и попадет в непокрытые.
        // читаем из importPaths, а не из automatedAssertions: последний ниже очищается по ходу цикла
        for (const importPath of importPaths.get(fullName) ?? []) {
          assertion.matchedTests.push({ source: 'storybook', name: fullName, filePath: importPath });
        }

        // имя использовано — убираем его, чтобы в конце остались только истории без описания
        automatedAssertions.delete(fullName);
      }
    }
  }

  for (const [name, { importPath }] of automatedAssertions.entries()) {
    validationContext.registerStorybookUnusedStory(name, importPath);
  }
};

export const loadStorybookIndex = async (path: string, basePath?: string) => {
  const json = await readTextFile(path, basePath);
  const data: unknown = JSON.parse(json);

  const entity = parseObject(data, storybookIndexDecoder);

  return entity;
};
