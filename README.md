# Belovodya UI Engine

Belovodya UI is a modular Home Assistant custom integration that registers its own panel and renders Lovelace dashboards through a custom Lit + TypeScript layout engine.

## What It Does

- installs through HACS as a custom integration
- ships a frontend bundle in `dist/` for dashboard/plugin-style distribution
- registers a Home Assistant panel at `/belovodya`
- reads Lovelace dashboard config through the official `lovelace/config` WebSocket command
- reads Home Assistant navigation from `hass.panels`
- renders Lovelace cards through the official `window.loadCardHelpers()` interface
- isolates scroll to main content while keeping the shell fixed

## HACS Installation

### Recommended: install as Integration

1. Add this repository to HACS as a custom repository with category `Integration`.
2. Install `Belovodya UI`.
3. Restart Home Assistant.
4. Go to `Settings -> Devices & Services -> Add Integration`.
5. Add `Belovodya UI`.
6. Open the new sidebar entry or navigate to `/belovodya`.

### Repository structure for Dashboard/Plugin compatibility

The repository also ships `dist/belovodya-ui.js`, so it satisfies the HACS dashboard/plugin file layout as well. HACS still treats `Integration` and `Dashboard` as separate repository types, so the supported end-to-end install path for the full engine remains the `Integration` category.

## Panel Registration

The backend registers a custom panel using the official `panel_custom.async_register_panel` API.

- panel URL: `/belovodya`
- web component: `belovodya-app`
- bundle URL: `/belovodya_ui_static/belovodya-ui.js`

## Dashboard Lifecycle

When the panel opens, Belovodya UI:

1. receives `hass`, `route`, `panel`, and `narrow` from Home Assistant
2. reads sidebar navigation from `hass.panels`
3. fetches Lovelace config with `lovelace/config`
4. parses views and cards into a layout AST
5. resolves the active Belovodya route
6. renders sidebar, navbar, and main layout

## Performance Model

- Sidebar and navbar are isolated custom elements and only update when their own inputs change.
- Main layout updates independently from the shell.
- Card creation is lazy and gated by `IntersectionObserver`.
- DOM mutations are batched with `requestAnimationFrame`.
- Card `hass` updates are diffed against relevant entity ids extracted from each card config.
- The panel bundle is loaded only when the panel route is opened.

## Frontend Build

```bash
cd frontend
npm install
npm run build
```

Build output:

- `dist/belovodya-ui.js`
- `custom_components/belovodya_ui/static/belovodya-ui.js`

## Integration Options

Current config flow options:

- `default_dashboard`: optional Lovelace dashboard URL path
- `sidebar_title`
- `sidebar_icon`
- `require_admin`

If `default_dashboard` is empty, Belovodya reads the default Lovelace dashboard.

## Dashboard Support Notes

Belovodya reads existing dashboards. It does not automatically create a Lovelace dashboard or rewrite Home Assistant's default dashboard configuration. That behavior is intentionally avoided to preserve Lovelace compatibility and Home Assistant navigation behavior.

## Project Layout

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
