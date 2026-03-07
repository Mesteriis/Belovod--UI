# Backend Development

## Зона ответственности

Backend Belovodya отвечает за:

- регистрацию custom panel `/belovodya`
- публикацию static bundle
- config flow
- передачу runtime panel config во frontend

Ключевые файлы:

- `custom_components/belovodya_ui/__init__.py`
- `custom_components/belovodya_ui/panel.py`
- `custom_components/belovodya_ui/config_flow.py`
- `custom_components/belovodya_ui/const.py`
- `custom_components/belovodya_ui/manifest.json`

## Главные принципы

### 1. Panel registration должна быть детерминированной

Frontend bundle подключается через `panel_custom.async_register_panel`.

Важно:

- `module_url` должен меняться при изменении runtime bundle
- для этого используется query по `mtime`

### 2. Static path и panel registration должны быть идемпотентными

Backend не должен плодить повторные регистрации и должен уметь пере-регистрировать panel после изменения config entry.

### 3. Backend не должен тянуть deprecated HA API

Использовать только актуальные интерфейсы Home Assistant Core.

## Текущие backend-инварианты

- panel URL: `/belovodya`
- static URL base: `/belovodya_ui_static`
- frontend bundle: `custom_components/belovodya_ui/static/belovodya-ui.js`
- panel config передаётся через `config` в `panel_custom.async_register_panel`

## Когда нужен reload config entry

Reload config entry нужен, если меняется:

- panel config
- `module_url`
- backend registration logic
- runtime bundle после `touch`, чтобы panel получила новый query string

## Когда нужен полный restart HA

Полный restart предпочтителен, если меняются:

- критичные backend hooks
- import graph интеграции
- manifest-зависимости
- поведение, которое не подхватывается `reload_config_entry`

## Runtime-копия и dev-копия

Есть две копии интеграции:

- dev repo:
  - `/Volumes/config/belovodya-ui/custom_components/belovodya_ui`
- runtime install:
  - `/Volumes/config/custom_components/belovodya_ui`

Если меняются backend-файлы, их нужно синхронизировать в runtime install.

## Безопасность изменений

Нельзя:

- ломать HACS-структуру репозитория
- менять panel URL без явной причины
- удалять cache-busting у `module_url`
- вводить скрытые backend side effects вне панели Belovodya
