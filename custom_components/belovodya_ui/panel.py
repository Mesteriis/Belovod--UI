from __future__ import annotations

from pathlib import Path
import logging
from typing import Any

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_DEFAULT_DASHBOARD,
    CONF_REQUIRE_ADMIN,
    CONF_SIDEBAR_ICON,
    CONF_SIDEBAR_TITLE,
    DATA_PANEL_REGISTERED,
    DATA_STATIC_REGISTERED,
    DEFAULT_DEFAULT_DASHBOARD,
    DEFAULT_REQUIRE_ADMIN,
    DEFAULT_SIDEBAR_ICON,
    DEFAULT_SIDEBAR_TITLE,
    DOMAIN,
    FRONTEND_BUNDLE_FILENAME,
    PANEL_COMPONENT_NAME,
    PANEL_URL_PATH,
    STATIC_DIR,
    STATIC_URL_BASE,
    VERSION,
)

_LOGGER = logging.getLogger(__name__)
_STATIC_ROOT = Path(__file__).parent / STATIC_DIR
_BUNDLE_PATH = _STATIC_ROOT / FRONTEND_BUNDLE_FILENAME


def _entry_options(entry: ConfigEntry) -> dict[str, Any]:
    """Merge config entry data with options, preferring options."""
    merged = dict(entry.data)
    merged.update(entry.options)
    return merged


def _build_panel_config(entry: ConfigEntry) -> dict[str, Any]:
    """Build runtime config passed into the custom panel."""
    options = _entry_options(entry)
    default_dashboard = str(
        options.get(CONF_DEFAULT_DASHBOARD, DEFAULT_DEFAULT_DASHBOARD)
    ).strip()

    return {
        CONF_DEFAULT_DASHBOARD: default_dashboard or None,
        CONF_SIDEBAR_TITLE: str(
            options.get(CONF_SIDEBAR_TITLE, DEFAULT_SIDEBAR_TITLE)
        ).strip()
        or DEFAULT_SIDEBAR_TITLE,
        CONF_SIDEBAR_ICON: str(options.get(CONF_SIDEBAR_ICON, DEFAULT_SIDEBAR_ICON)).strip()
        or DEFAULT_SIDEBAR_ICON,
        CONF_REQUIRE_ADMIN: bool(
            options.get(CONF_REQUIRE_ADMIN, DEFAULT_REQUIRE_ADMIN)
        ),
        "engine_version": VERSION,
        "panel_url_path": PANEL_URL_PATH,
    }


async def async_register_panel(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Register the Belovodya static assets and panel."""
    if not _BUNDLE_PATH.is_file():
        _LOGGER.warning(
            "Belovodya frontend bundle is missing at %s; panel registration skipped",
            _BUNDLE_PATH,
        )
        return

    domain_data = hass.data.setdefault(DOMAIN, {})
    if not domain_data.get(DATA_STATIC_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL_BASE, str(_STATIC_ROOT), cache_headers=True)]
        )
        domain_data[DATA_STATIC_REGISTERED] = True

    panel_config = _build_panel_config(entry)
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT_NAME,
        sidebar_title=panel_config[CONF_SIDEBAR_TITLE],
        sidebar_icon=panel_config[CONF_SIDEBAR_ICON],
        module_url=(
            f"{STATIC_URL_BASE}/{FRONTEND_BUNDLE_FILENAME}"
            f"?v={panel_config['engine_version']}-{int(_BUNDLE_PATH.stat().st_mtime_ns)}"
        ),
        config=panel_config,
        require_admin=panel_config[CONF_REQUIRE_ADMIN],
    )
    domain_data[DATA_PANEL_REGISTERED] = True


async def async_unregister_panel(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove the Belovodya panel registration."""
    del entry
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    hass.data.setdefault(DOMAIN, {})[DATA_PANEL_REGISTERED] = False
