from __future__ import annotations

from typing import Final

DOMAIN: Final = "belovodya_ui"
NAME: Final = "Belovodya UI"
VERSION: Final = "0.0.2"

PANEL_COMPONENT_NAME: Final = "belovodya-app"
PANEL_URL_PATH: Final = "belovodya"
FRONTEND_BUNDLE_FILENAME: Final = "belovodya-ui.js"
STATIC_DIR: Final = "static"
STATIC_URL_BASE: Final = f"/{DOMAIN}_static"
CONFIG_ENTRY_TITLE: Final = "Belovodya UI Engine"

CONF_DEFAULT_DASHBOARD: Final = "default_dashboard"
CONF_SIDEBAR_TITLE: Final = "sidebar_title"
CONF_SIDEBAR_ICON: Final = "sidebar_icon"
CONF_REQUIRE_ADMIN: Final = "require_admin"

DEFAULT_DEFAULT_DASHBOARD: Final = ""
DEFAULT_SIDEBAR_TITLE: Final = "Belovodya"
DEFAULT_SIDEBAR_ICON: Final = "mdi:view-dashboard-variant"
DEFAULT_REQUIRE_ADMIN: Final = False

DATA_STATIC_REGISTERED: Final = "static_registered"
DATA_PANEL_REGISTERED: Final = "panel_registered"
