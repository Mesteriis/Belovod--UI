# Runtime Development Workflow

## Цель

Этот документ описывает локальный цикл доработки без push в git и без публикации через HACS.

## Модель

Работа идёт в двух зонах:

1. исходники

```text
/Volumes/config/belovodya-ui
```

2. установленная runtime-копия Home Assistant

```text
/Volumes/config/custom_components/belovodya_ui
```

## Быстрый цикл для frontend

Ручной вариант:

```bash
cd /Volumes/config/belovodya-ui/frontend
npm run typecheck
npm run build
cp -f /Volumes/config/belovodya-ui/dist/belovodya-ui.js \
  /Volumes/config/custom_components/belovodya_ui/static/belovodya-ui.js
touch /Volumes/config/custom_components/belovodya_ui/static/belovodya-ui.js
```

Потом:

1. reload config entry
2. hard reload `/belovodya`

## Автоматизированный цикл

Для этого используется:

```bash
./scripts/dev-sync.sh
```

Что делает скрипт по умолчанию:

1. запускает `npm run typecheck`
2. запускает `npm run build`
3. копирует runtime bundle в установленную интеграцию
4. делает `touch` bundle для нового `module_url`

## Флаги скрипта

### `--backend`

Дополнительно синхронизирует backend-файлы из dev repo в runtime install.

### `--reload`

Пытается вызвать `reload_config_entry` через Home Assistant REST API.

Для этого нужны env vars:

```bash
export HA_URL="http://192.168.1.4:8123"
export HA_TOKEN="..."
export BELOVODYA_ENTRY_ID="01KK2KT7JHJVVMBJ9AQWARV3NK"
```

Пример:

```bash
HA_URL="http://192.168.1.4:8123" \
HA_TOKEN="<long-lived-access-token>" \
BELOVODYA_ENTRY_ID="01KK2KT7JHJVVMBJ9AQWARV3NK" \
./scripts/dev-sync.sh --reload
```

### `--backend --reload`

Полный dev-cycle в одной команде:

- build
- sync frontend
- sync backend
- touch bundle
- reload config entry

## Make target

Для удобства есть alias:

```bash
make dev-sync
```

Он вызывает:

```bash
./scripts/dev-sync.sh
```

## Когда нужен `touch`

Home Assistant регистрирует frontend module URL с query-параметром по `mtime` bundle.

Если `mtime` не изменился, браузер может держать старую версию модуля.

Поэтому `touch` после копирования runtime bundle обязателен.

## Минимальный runtime checklist

После заметной правки проверить:

1. `/belovodya` открывается
2. загружается новый `module_url`
3. нативный HA rail скрыт
4. shell не уезжает по ширине
5. navigation / drawer / collapse работают
6. нет новых ошибок в browser console
