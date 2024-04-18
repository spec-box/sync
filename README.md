# @spec-box/sync

В этом репозитории находится command line утилита для выгрузки информации о функциональных требованиях, хранящейся в файлах проекта, во внешнюю базу функциональных требований. Информация о функциональных требованиях должна храниться в [yml файлах](https://yaml.org) в формате, [описанном ниже](#формат-yml).

## Быстрый старт

1. Установите пакет @spec-box/sync из внешнего npm
   ```sh
   npm i @spec-box/sync --registry=https://registry.npmjs.org -D
   ```
2. Создайте конфигурационный файл `.tms.json`:
   ```js
   {
       "api": {
           "host": "http://localhost:5059",
           "project": "id"
       },
       "yml": {
           "files": [
               "tests/unit/**/*.unit.testpalm.yml"
           ]
       }
   }
   ```
3. Запустите валидацию данных
   ```sh
   npx spec-box validate
   ```
4. Запустите выгрузку
   ```sh
   npx spec-box sync
   ```
   Передав опциональный параметр `--message`, вы можете указать дополнительную информацию, которая будет полезна для понимания контекста выгрузки. Например, вы можете указать название ветки VCS.
   ```sh
   npx spec-box sync --message="my commit message"
   ```
5. Запустите выгрузку статистики о выполнении тестов из отчета Jest (опционально)
   ```sh
   npx spec-box upload-stat
   ```
   В базу функциональных требований будет выгружены: дата и время запуска тестов, суммарное количество тестов, суммарное время выполнения (как если бы тесты выполнялись в одном потоке)

## Описание функциональности

### Формат yml

Каждый yml файл описывает функциональные требования отдельной фичи (целостного функционального блока) проекта. Для фичи указываются: уникальный код (по которму можно сослатсья на нее), название, дополнительная мета-информация (атрибуты) и список функциональных требований, объединенных в группы.

Пример описания ФТ в yml файле:

```yaml
feature: Главная страница    # понятное для человека название фичи
description: Пример описания  # описание фичи (опционально)

code: home-page              # уникальный (в пределах проекта) код фичи, по которому можно на не ссылаться
type: Functional             # тип требований (опционально, может принимать значения Functional и Visual)

# список функциональных требований (утверждений о продукте), объединенных в группы
specs-unit:
  Промо-блок:
    - assert: Отображается "карусель" со слайдами
      description: Пример описания  #  (опционально)
    - assert: Для каждого слайда отображается заголовок, описание и фото, значения которых пришли с бэкенда

  Блок корзины:
    - assert: Отображается количество и общая стоимость товаров в корзине
    - assert: Отображается кнопка "Оформить заказ", при нажати пользователь переходит на страницу оформления заказа
```

### Уникальный код фичи

Поле `code` у фичи является обязательным. Оно должно содержать уникальное значение в пределах проекта, по которому можно сослаться на фичу.

**Важно:** значение поля `code` может содержать только английские буквы, цифры, знаки `-` (дефис) и `_` (подчеркивание) и должно начинаться с буквы.

В названиях и описаниях фичей и функциональных требований (поля `feature`, `assert` и `description`) вы можете указать код другой фичи, добавив в начало знак `$`. При запуске валидации данных (команда `validate`) будет автоматически проверена корректность таких ссылок.

Например:

```yaml
feature: Страница оформления заказа
code: checkout-page

# в описании ссылка на другую фичу с кодом 'product-card'
description: Пользователь попадает на эту страницу с карточки товара $product-card

specs-unit:
  Выбор адреса доставки:
      # в тексте функционального требования ссылка на другую фичу с кодом 'address-dialog'
    - assert: При нажатии на кнопку "Выбрать адрес" открывается диалог выбора адреса на карте $address-dialog
```

## Мета-информация

> Обратите внимание, формат поля `code` для сущностей мета-информации — такой же, как [формат](#уникальный-код-фичи) поля `code` для фичей

Вы можете создать в корне проекта файл `.spec-box-meta.yml` и описать в нем мета-информацию для фичей: атрбуты и порядок группировки для просмотра в виде дерева.

> Вы можете хранить мета-информацию в файле с другим названием. Для этого укажите путь к файлу в конфигурационном файле `.tms.json` в поле `yml => metaPath`

### Разметка фичей атрибутами

Вы можете размечать фичи атрибутами, чтобы фильтровать и группировать по ним список фичей.

Задайте список атрибутов и их значений в файле `.spec-box-meta.yml` в поле `attributes`. Для каждого атрибата и значения нужно указать код (должен быть уникальным в пределах проекта) и отображаемый текст (для просмотра в интерфейсе):

```yaml
attributes:
  - code: attr1
    title: Пример атрибута 1
    values:
      - code: cats
        title: Кошки
      - code: dogs
        title: Собаки
  - code: attr2
    title: Пример атрибута 2
    values:
      - code: predators
        title: Хищники
      - code: herbivores
        title: Травоядные
```

После этого вы можете указывать атрибуты для фичей в поле `definitions`:

```yaml
feature: Пример названия фичи
code: example-code

# список функциональных требований
# ...

# список атрибутов фичи
definitions:
  attr1:        # код атрибута
    - dogs      # код значения
  attr2:
    - predators # для одного атрибута можно указать несколько значений
    - herbivores
```

Если вы указали для фичи код атрибута, который не описан в файле `.spec-box-meta.yml`, то при выгрузке вы увидите сообщение об ошибке. Если вы укажете для фичи значение существующего атрибута, которое не описано в `.spec-box-meta.yml`, то значение будет выгружено в базу ФТ, в качестве отображаемого текста будет использоваться код значения.

### Группировка фичей по атрибутам

Вы можете настраивать варианты группировки фичей по атрибутам для просмотра в структурированном виде. Добавьте в `.spec-box-meta.yml` поле `trees`. Для каждого дерева укажите уникальный код, название (отображаемый текст для просмотра в интерфейсе) и список атрибутов для группировки:

```yaml
attributes:
  # ... список атрибутов
trees:
  - code: ui-structure              # уникальный код
    title: Разбивка по страницам    # название
    group-by:                       # порядок группировки
      - page
      - component
```

## Автоматическое определение признака automationState

Вместе с информацией о функциональных требованиях можно выгружать информацию о том, что их проверка автоматизирована. Для некоторых видов автотестов реализовано автоматическое вычисление признака `automationState`. На текущий момент поддерживаются `jest` и `storybook`.

### Jest

Отчет о выполнении тестов можно сформировать, запустив jest с параметром `--json`, например:

```sh
jest --json --outputFile=jest-report.json
```

Чтобы добавить в выгрузку ФТ информацию из отчета jest, добавьте в корень [конфигурационного файла](#формат-конфига) секцию `"jest"`:

```js
{
    // ...
    "jest": {
        // путь к файлу с отчетом о выполнении тестов
        "reportPath": "jest-report.json",

        // сегменты идентификатора для сопоставления автотестов с ФТ
        "keys": ["featureTitle", "groupTitle", "assertionTitle"]
    }
```

Для каждого ФТ, описанного в yml файлах проекта, будет сформирован уникальный идентификатор на основе поля `"keys"`. Если в отчете jest есть тест, полное имя которого совпадает с идентификатором ФТ, то считается, что проверка этого ФТ — автоматизирована.

Например, если в проекте есть yml файл с содержимым, [указанным выше](#формат-yml) и поле `"keys"` в разделе `"jest"` конфигурационного файла имеет значение `["featureTitle", "groupTitle", "assertionTitle"]`, то указанный ниже тест будет сопоставлен с ФТ `"Отображается количество и общая стоимость товаров в корзине"`:

```js
describe('Главная страница', () => {
    describe('Блок корзины', () => {
        test('Отображается количество и общая стоимость товаров в корзине', () => {
            // ...
        });
    });
});
```

В качестве частей идентификатора допустимо указывать следующие значения:

- `"featureTitle"` — название фичи
- `"featureCode"` — уникальный код фичи
- `"groupTitle"` — название группы ФТ
- `"assertionTitle"` — название ФТ
- `"filePath"` — путь к yml файлу, относительно корня проекта
- `"fileName"` — название yml файла без расширения (от начала до первого символа `.`)
- `@<attribute>` — значение указанного атрибута (идентификатор значения)
- `$<attribute>` — значение указанного атрибута (человеко-понятное название)

### Storybook

Мы считаем, что если в сторибуке написана история, то она проверяется скриншотным тестом и проверку соответствующего ФТ считаем автоматизированной. В качестве входной информации нужно предоставить синхронизатору файл `index.json`, который формируется сторибуком при сборке и содержит список историй. Поддерживается Storybook v7 и выше.

Чтобы добавить в выгрузку ФТ информацию из storybook, добавьте в корень [конфигурационного файла](#формат-конфига) секцию `"storybook"`:

```js
{
    // ...
    "storybook": {
        // путь к файлу index.json, генерируемого при билде сторибука
        "indexPath": "index.json",

        // сегменты идентификатора для сопоставления автотестов с ФТ
        "keys": ["featureTitle", "groupTitle", "assertionTitle"]
    }
```

Поле `"keys"` работает таким же образом, как и для [конфигурации jest](###jest). Если в `index.json` есть стори, путь до которой в дереве сторей совпадает с идентификатором ФТ, то считается, что проверка этого ФТ — автоматизирована.

Например, если в проекте есть yml файл с содержимым, [указанным выше](#формат-yml) и поле `"keys"` в разделе `"storybook"` конфигурационного файла имеет значение `["featureTitle", "groupTitle", "assertionTitle"]`, то указанная ниже стори будет сопоставлена с ФТ `"Отображается количество и общая стоимость товаров в корзине"`:

```js
import type { Meta, StoryObj } from '@storybook/react';
import { Cart } from './Cart';

export default {
  title: 'Главная страница/Блок корзины',
  component: Cart,
} as Meta;

type Story = StoryObj<typeof Cart>;

export const Default: Story = {
  name: 'Отображается количество и общая стоимость товаров в корзине',
  render: () => <Cart />,
};
```

## Формат конфига

Ниже указаны все возможные параметры конфигурационного файла:

```js
{
    "projectPath": "/aaa/bbb", // путь к корневой папке проекта, опционально
    // настройки выгрузки
    "api": {
        "host": "http://localhost:5059",
        "project": "id"
    },
    // уровни ошибок: error / warning / info / off
    "validation": {
        // ссылка на несуществующую фичу
        "feature-missing-link": "error",

        // тест, не описанный в yml
        "jest-unused": "error"
    }
    "yml": {
        // путь к файлу с мета-информацией, относительно корня проекта, опционально
        "metaPath": "./configs/spec-box-meta.yml",

        // настройки хранения в проекте информации о функциональных требоваинях в yml
        "files": [
            // шаблоны путей указываются относительно корня проекта
            "tests/unit/**/*.unit.testpalm.yml"
        ]
    },
    // настройки для сопоставления ФТ с отчетами jest
    "jest": {
        "reportPath": "jest-report.json", // путь к файлу с отчетом о выполнении тестов
        "keys": [ // сегменты идентификатора для сопоставления автотестов с ФТ
            "featureTitle",
            "$sub-component",
            "groupTitle",
            "assertionTitle"
        ]
    }
    // настройки для сопоставления ФТ с историями storybook
    "storybook": {
        "indexPath": "index.json", // путь к файлу index.json, генерируемого при билде сторибука
        "keys": [ // сегменты идентификатора для сопоставления историй из storybook с ФТ
            "featureTitle",
            "$sub-component",
            "groupTitle",
            "assertionTitle"
        ]
    }
}
```
