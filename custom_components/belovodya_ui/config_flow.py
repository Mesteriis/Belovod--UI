from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import (
    CONF_DEFAULT_DASHBOARD,
    CONF_REQUIRE_ADMIN,
    CONF_SIDEBAR_ICON,
    CONF_SIDEBAR_TITLE,
    CONFIG_ENTRY_TITLE,
    DEFAULT_DEFAULT_DASHBOARD,
    DEFAULT_REQUIRE_ADMIN,
    DEFAULT_SIDEBAR_ICON,
    DEFAULT_SIDEBAR_TITLE,
    DOMAIN,
)


def _schema_with_defaults(user_input: Mapping[str, Any] | None = None) -> vol.Schema:
    """Return the config flow schema with defaults applied."""
    values = dict(user_input or {})
    return vol.Schema(
        {
            vol.Optional(
                CONF_DEFAULT_DASHBOARD,
                default=values.get(CONF_DEFAULT_DASHBOARD, DEFAULT_DEFAULT_DASHBOARD),
            ): str,
            vol.Optional(
                CONF_SIDEBAR_TITLE,
                default=values.get(CONF_SIDEBAR_TITLE, DEFAULT_SIDEBAR_TITLE),
            ): str,
            vol.Optional(
                CONF_SIDEBAR_ICON,
                default=values.get(CONF_SIDEBAR_ICON, DEFAULT_SIDEBAR_ICON),
            ): str,
            vol.Optional(
                CONF_REQUIRE_ADMIN,
                default=values.get(CONF_REQUIRE_ADMIN, DEFAULT_REQUIRE_ADMIN),
            ): bool,
        }
    )


def _normalize_input(data: Mapping[str, Any]) -> dict[str, Any]:
    """Normalize and sanitize form data."""
    return {
        CONF_DEFAULT_DASHBOARD: str(data.get(CONF_DEFAULT_DASHBOARD, "")).strip(),
        CONF_SIDEBAR_TITLE: str(data.get(CONF_SIDEBAR_TITLE, DEFAULT_SIDEBAR_TITLE)).strip()
        or DEFAULT_SIDEBAR_TITLE,
        CONF_SIDEBAR_ICON: str(data.get(CONF_SIDEBAR_ICON, DEFAULT_SIDEBAR_ICON)).strip()
        or DEFAULT_SIDEBAR_ICON,
        CONF_REQUIRE_ADMIN: bool(data.get(CONF_REQUIRE_ADMIN, DEFAULT_REQUIRE_ADMIN)),
    }


class BelovodyaUiConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Belovodya UI config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(
                title=CONFIG_ENTRY_TITLE,
                data=_normalize_input(user_input),
            )

        return self.async_show_form(
            step_id="user",
            data_schema=_schema_with_defaults(),
        )

    @staticmethod
    def async_get_options_flow(
        entry: config_entries.ConfigEntry,
    ) -> "BelovodyaUiOptionsFlow":
        """Return the options flow."""
        return BelovodyaUiOptionsFlow(entry)


class BelovodyaUiOptionsFlow(config_entries.OptionsFlow):
    """Belovodya UI options flow."""

    def __init__(self, entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._entry = entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the Belovodya UI options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=_normalize_input(user_input))

        current = dict(self._entry.data)
        current.update(self._entry.options)
        return self.async_show_form(
            step_id="init",
            data_schema=_schema_with_defaults(current),
        )
