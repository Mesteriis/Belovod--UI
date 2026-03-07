#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
DEV_COMPONENT_DIR="$ROOT_DIR/custom_components/belovodya_ui"
RUNTIME_COMPONENT_DIR="${RUNTIME_COMPONENT_DIR:-/Volumes/config/custom_components/belovodya_ui}"
RUNTIME_BUNDLE="$RUNTIME_COMPONENT_DIR/static/belovodya-ui.js"
HA_URL="${HA_URL:-}"
HA_TOKEN="${HA_TOKEN:-}"
BELOVODYA_ENTRY_ID="${BELOVODYA_ENTRY_ID:-}"
SYNC_BACKEND=false
RELOAD_ENTRY=false

usage() {
  cat <<USAGE
Usage: ./scripts/dev-sync.sh [--backend] [--reload]

Options:
  --backend   Sync backend files from dev repo into runtime install.
  --reload    Call Home Assistant reload_config_entry service.

Environment for --reload:
  HA_URL
  HA_TOKEN
  BELOVODYA_ENTRY_ID

Optional environment:
  RUNTIME_COMPONENT_DIR
USAGE
}

while (($# > 0)); do
  case "$1" in
    --backend)
      SYNC_BACKEND=true
      ;;
    --reload)
      RELOAD_ENTRY=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

echo "[dev-sync] frontend typecheck"
(
  cd "$FRONTEND_DIR"
  npm run typecheck
)

echo "[dev-sync] frontend build"
(
  cd "$FRONTEND_DIR"
  npm run build
)

if [[ ! -f "$ROOT_DIR/dist/belovodya-ui.js" ]]; then
  echo "[dev-sync] built bundle not found: $ROOT_DIR/dist/belovodya-ui.js" >&2
  exit 1
fi

mkdir -p "$RUNTIME_COMPONENT_DIR/static"
cp -f "$ROOT_DIR/dist/belovodya-ui.js" "$RUNTIME_BUNDLE"
touch "$RUNTIME_BUNDLE"
echo "[dev-sync] synced runtime bundle -> $RUNTIME_BUNDLE"

if [[ "$SYNC_BACKEND" == true ]]; then
  echo "[dev-sync] syncing backend files"
  rsync -a \
    --delete \
    --exclude '__pycache__/' \
    --exclude 'static/belovodya-ui.js' \
    "$DEV_COMPONENT_DIR/" "$RUNTIME_COMPONENT_DIR/"
fi

if [[ "$RELOAD_ENTRY" == true ]]; then
  if [[ -z "$HA_URL" || -z "$HA_TOKEN" || -z "$BELOVODYA_ENTRY_ID" ]]; then
    echo "[dev-sync] --reload requires HA_URL, HA_TOKEN and BELOVODYA_ENTRY_ID" >&2
    exit 1
  fi

  echo "[dev-sync] reloading config entry $BELOVODYA_ENTRY_ID"
  curl -fsS \
    -X POST \
    -H "Authorization: Bearer $HA_TOKEN" \
    -H "Content-Type: application/json" \
    "$HA_URL/api/services/homeassistant/reload_config_entry" \
    -d "{\"entry_id\":\"$BELOVODYA_ENTRY_ID\"}" >/dev/null
  echo "[dev-sync] reload request sent"
else
  cat <<'NOTE'
[dev-sync] runtime files are updated.
[dev-sync] next step:
  1. reload config entry manually, or rerun with --reload
  2. hard reload /belovodya
NOTE
fi
