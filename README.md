# Belovodya UI Engine

Belovodya UI Engine — это кастомная интеграция Home Assistant, которая устанавливается через HACS, регистрирует собственную панель `/belovodya` и рендерит Lovelace dashboard через собственный UI-движок на Lit + TypeScript.

[![Open your Home Assistant instance and open this repository inside HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Mesteriis&repository=Belovod--UI&category=integration)

## Что умеет

- устанавливается через HACS как `Integration`
- не требует ручного копирования файлов в `custom_components`
- регистрирует отдельную панель Home Assistant: `/belovodya`
- читает Lovelace config через официальный WebSocket `lovelace/config`
- читает навигацию Home Assistant из `hass.panels`
- рендерит Lovelace cards через официальный `window.loadCardHelpers()`
- использует собственный layout engine с зонами `sidebar / navbar / main`
- изолирует скролл внутри main content

## Важное ограничение Home Assistant

HACS устанавливает файлы интеграции, но не создает `config entry` автоматически.

Это означает:

- путь `HACS -> Install` работает
- ручное копирование файлов не нужно
- после установки все равно нужен стандартный шаг Home Assistant: `Settings -> Devices & Services -> Add Integration -> Belovodya UI`

Полностью свести установку panel-интеграции к одному клику `Install` невозможно без обхода стандартной модели Home Assistant. Репозиторий приведен к максимально короткому штатному пути установки.

## Установка через HACS

1. Откройте HACS.
2. Добавьте кастомный репозиторий `https://github.com/Mesteriis/Belovod--UI` с категорией `Integration`.
3. Нажмите `Install` у `Belovodya UI`.
4. Перезапустите Home Assistant.
5. Откройте `Settings -> Devices & Services`.
6. Нажмите `Add Integration`.
7. Найдите `Belovodya UI`.
8. После добавления откройте пункт в sidebar или перейдите на `/belovodya`.

## Что установится через HACS

HACS установит интеграцию в:

```text
custom_components/belovodya_ui/
```

Внутри интеграции уже лежит frontend bundle панели:

```text
custom_components/belovodya_ui/static/belovodya-ui.js
```

Дополнительный `frontend resource` вручную добавлять не нужно.

## Как работает запуск панели

После создания integration entry backend:

1. регистрирует static path `/belovodya_ui_static`
2. регистрирует custom panel через `panel_custom.async_register_panel`
3. подключает web component `belovodya-app`
4. передает panel config во frontend

Параметры панели:

- URL: `/belovodya`
- web component: `belovodya-app`
- bundle: `/belovodya_ui_static/belovodya-ui.js`

## Lifecycle панели

При открытии панели Belovodya UI:

1. получает `hass`, `route`, `panel`, `narrow`
2. считывает sidebar navigation из `hass.panels`
3. получает Lovelace config через `lovelace/config`
4. парсит `views` и `cards` в layout AST
5. определяет активный route
6. рендерит sidebar, navbar и main layout

## Производительность

Используемые оптимизации:

- shell-компоненты `sidebar` и `navbar` рендерятся изолированно
- main content обновляется отдельно от shell
- карточки создаются лениво через `IntersectionObserver`
- DOM-изменения батчатся через `requestAnimationFrame`
- обновление `hass` для карточек делается только при изменении релевантных entity
- bundle панели загружается только при открытии `/belovodya`

## Настройки интеграции

Сейчас доступны параметры через config flow:

- `default_dashboard`: путь Lovelace dashboard, который нужно открыть по умолчанию
- `sidebar_title`: заголовок пункта в sidebar
- `sidebar_icon`: иконка sidebar-пункта
- `require_admin`: ограничение панели только для администратора

Если `default_dashboard` пустой, Belovodya UI читает default Lovelace dashboard.

## Документация для разработки

Точка входа в локальную dev-документацию: [DEVELOPMENT.md](./DEVELOPMENT.md).

Разделы:

- [docs/frontend.md](./docs/frontend.md)
- [docs/backend.md](./docs/backend.md)
- [docs/runtime-dev.md](./docs/runtime-dev.md)

Быстрый локальный цикл:

```bash
./scripts/dev-sync.sh
```

Или:

```bash
make dev-sync
```

## Разработка frontend

```bash
cd frontend
npm install
npm run build
```

Результат сборки:

- `dist/belovodya-ui.js`
- `custom_components/belovodya_ui/static/belovodya-ui.js`

## Структура репозитория

```text
custom_components/
  belovodya_ui/
    __init__.py
    config_flow.py
    const.py
    manifest.json
    panel.py
    static/
      belovodya-ui.js
frontend/
  src/
    belovodya-app.ts
    belovodya-layout.ts
    belovodya-sidebar.ts
    belovodya-navbar.ts
    belovodya-router.ts
    lovelace-parser.ts
    card-renderer.ts
    layout-engine/
      layout-node.ts
      layout-grid.ts
      layout-stack.ts
  css/
    layout.css
    sidebar.css
    navbar.css
    cards.css
    theme.css
    animations.css
dist/
  belovodya-ui.js
hacs.json
README.md
```

## Совместимость

- Home Assistant `2024.1+`
- HACS custom repository type: `Integration`

## Поддержка

- Issues: `https://github.com/Mesteriis/Belovod--UI/issues`
- Repository: `https://github.com/Mesteriis/Belovod--UI`
