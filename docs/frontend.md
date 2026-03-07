# Frontend Development

## Зона ответственности

Frontend Belovodya отвечает за:

- fullscreen shell панели `/belovodya`
- suppress нативного HA shell внутри панели
- sidebar / navbar / drawer / main shell
- локальное UI-state поведение
- будущий layout engine и card rendering

Ключевые файлы:

- `frontend/src/belovodya-app.ts`
- `frontend/src/ha-shell.ts`
- `frontend/src/ha-sidebar.ts`
- `frontend/src/notifications.ts`
- `frontend/src/lovelace-parser.ts`
- `frontend/css/layout.css`
- `frontend/css/sidebar.css`
- `frontend/css/navbar.css`
- `frontend/css/notifications.css`
- `frontend/css/theme.css`

## Основные принципы

### 1. Реальный runtime важнее догадок

Если нужно повторить поведение Home Assistant:

1. сначала смотреть живой DOM и shadow roots
2. потом использовать `hass` API
3. только потом fallback-логику

### 2. Shell не должен ломать Home Assistant вне `/belovodya`

Frontend может подавлять нативный HA shell только внутри Belovodya panel.

Нельзя:

- глобально скрывать `ha-sidebar`
- менять layout вне `belovodya-app`
- вмешиваться в обычные HA страницы

### 3. Производительность важнее декоративного эффекта

Правила:

- избегать лишних observers
- не перерисовывать весь shell при локальной правке одного блока
- переносить expensive logic в helper-файлы
- использовать CSS и layout-перестройку вместо тяжёлых DOM-manipulations

## Текущие UI-инварианты

На текущем этапе:

- Belovodya shell занимает весь viewport
- нативный HA rail скрывается через `ha-shell.ts`
- sidebar width:
  - expanded: `256px`
  - collapsed: `96px`
- collapse toggle висит на бренд-блоке с логотипом
- активный navigation item рендерится первым
- `sidebar__nav-card` scroll работает, scrollbar скрыт визуально
- `sidebar__status` содержит только вертикальный стек кнопок
- notifications drawer выезжает поверх всей панели

## Sidebar

Источник данных:

1. сначала живой DOM нативного `ha-sidebar`
2. затем fallback через `hass.panels`

Реализация:

- `frontend/src/ha-sidebar.ts`

Правила:

- не мутировать исходный snapshot sidebar без необходимости
- визуальная перестановка active item должна делаться только на этапе render-order
- utility actions должны оставаться отделёнными от main navigation

## Notifications Drawer

Источник данных:

- `persistent_notification/get`
- `repairs/list_issues`

Реализация:

- `frontend/src/notifications.ts`
- `frontend/css/notifications.css`
- состояние и рендер в `frontend/src/belovodya-app.ts`

Правила:

- drawer свой, не нативный HA drawer
- данные штатные, из HA API
- закрытие обязано работать по backdrop и `Escape`
- overlay не должен ломать layout sidebar/main

## CSS-принципы

- layout, theme и feature-specific CSS должны быть разнесены по отдельным файлам
- изменения ширины/sidebar/drawer должны идти через CSS variables или локальные CSS-блоки
- global-override для внешнего HA UI не делать через обычный CSS Belovodya; для этого есть `ha-shell.ts`

## Когда править какой файл

- shell layout: `frontend/css/layout.css`
- sidebar visuals: `frontend/css/sidebar.css`
- global tokens / widths / fonts: `frontend/css/theme.css`
- notifications drawer: `frontend/css/notifications.css`
- route / shell orchestration / UI state: `frontend/src/belovodya-app.ts`
- suppress нативного shell: `frontend/src/ha-shell.ts`
- navigation extraction: `frontend/src/ha-sidebar.ts`

## Проверка frontend-правок

Минимальный чек-лист:

1. `/belovodya` открывается без runtime ошибок
2. нативный HA rail скрыт
3. sidebar expanded/collapsed работает
4. main не уезжает по ширине
5. active navigation item вверху
6. drawer не ломает z-index и геометрию
7. hover/active состояния не вызывают layout shift
