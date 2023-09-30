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
3. Запустите выгрузку
   ```sh
   npx spec-box sync
   ```
4. Запустите выгрузку статистики о выполнении тестов из отчета Jest (опционально)
   ```sh
   npx spec-box upload-stat
   ```
   В базу функциональных требований будет выгружены: дата и время запуска тестов, суммарное количество тестов, суммарное время выполнения (как если бы тесты выполнялись в одном потоке)


## Формат yml

Каждый yml файл описывает функциональные требования отдельной фичи (целостного функционального блока) проекта. Для фичи указываются: уникальный код (по которму можно сослатсья на нее), название, дополнительная мета-информация (атрибуты) и список функциональных требований, объединенных в группы.

Пример описания ФТ в yml файле:

```yaml
feature: Главная страница   # понятное для человека название фичи
code: home-page             # уникальный (в пределах проекта) код фичи, по которому можно на не ссылаться

# список функциональных требований (утверждений о продукте), объединенных в группы
specs-unit:
  Промо-блок:
    - assert: Отображается "карусель" со слайдами
    - assert: Для каждого слайда отображается заголовок, описание и фото, значения которых пришли с бэкенда

  Блок корзины:
    - assert: Отображается количество и общая стоимость товаров в корзине
    - assert: Отображается кнопка "Оформить заказ", при нажати пользователь переходит на страницу оформления заказа
```

## Мета-информация

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

### Группировка фичей пот атрибутам

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

## Автоматическое определение признака isAutomated

Вместе с информацией о функциональных требованиях можно выгружать информацию о том, что их проверка автоматизирована. Определение автоматизированных ФТ выполняется автоматически, на основе информации об отчете jest в формате json. Отчет о выполнении тестов можно сформировать, запустив jest с параметром `--json`, например:

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
        "keys": [ //
            "featureTitle",
            "$sub-component",
            "groupTitle",
            "assertionTitle"
        ]
    }
}
```
## Обработка ошибок валидации

- неправильный формат yml (выдавать все неправильные файлы в начале работы и выполнять последующую валидацию, потом вместо выгрузки падать с ошибкой)
- целостность ссылок
- формат кода фичи, атрибутов, деревьев: английские буквы и цифры и подчеркивание дефис, начинается с буквы
- проверка наличия используемых атрибутов (разметка атрибутами и использование в деревьях) в конфиге
- неизвестные тесты (выводить название теста и предлагать варианты ключей, сравнивая по тексту ассерта)

## TODO

- логирование и обработка ошибок
- формирование кода по конфигу
