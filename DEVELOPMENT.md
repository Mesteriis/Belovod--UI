# Development Guide

`DEVELOPMENT.md` теперь является входной точкой в dev-документацию.

## Документы

- [docs/frontend.md](./docs/frontend.md)
- [docs/backend.md](./docs/backend.md)
- [docs/runtime-dev.md](./docs/runtime-dev.md)

## Быстрый локальный цикл

Frontend-only:

```bash
./scripts/dev-sync.sh
```

Frontend + backend + reload config entry:

```bash
HA_URL="http://192.168.1.4:8123" \
HA_TOKEN="<long-lived-access-token>" \
BELOVODYA_ENTRY_ID="01KK2KT7JHJVVMBJ9AQWARV3NK" \
./scripts/dev-sync.sh --backend --reload
```

## Что где читать

- как править frontend shell, sidebar, drawer и UI state:
  - [docs/frontend.md](./docs/frontend.md)
- как устроен backend и panel registration:
  - [docs/backend.md](./docs/backend.md)
- как крутить локальный runtime цикл и чем пользоваться при доработке:
  - [docs/runtime-dev.md](./docs/runtime-dev.md)
