export interface HassUser {
  is_admin: boolean;
}

export interface PanelInfo<T = Record<string, unknown> | null> {
  component_name: string;
  config: T;
  icon: string | null;
  title: string | null;
  url_path: string;
  default_visible?: boolean;
  require_admin?: boolean;
  show_in_sidebar?: boolean;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  panels: Record<string, PanelInfo>;
  user?: HassUser;
  language: string;
  selectedTheme: unknown;
  themes: unknown;
  callWS<T>(message: { type: string; [key: string]: unknown }): Promise<T>;
  localize?(key: string, placeholders?: Record<string, string>): string | undefined;
}

export interface Route {
  path: string;
  prefix: string;
}

export interface BelovodyaPanelRuntimeConfig {
  default_dashboard: string | null;
  engine_version: string;
  panel_url_path: string;
  sidebar_title: string;
  sidebar_icon: string;
  require_admin: boolean;
  _panel_custom?: Record<string, unknown>;
}

export interface BelovodyaPanelInfo extends PanelInfo<BelovodyaPanelRuntimeConfig> {}

export interface HANavigationItem {
  path: string;
  title: string;
  icon: string;
}

export interface LovelaceCardConfig {
  type: string;
  view_layout?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LovelaceSectionConfig {
  title?: string;
  cards?: LovelaceCardConfig[];
  [key: string]: unknown;
}

export interface LovelaceViewConfig {
  path?: string;
  title?: string;
  type?: string;
  subview?: boolean;
  cards?: LovelaceCardConfig[];
  sections?: LovelaceSectionConfig[];
  [key: string]: unknown;
}

export interface LovelaceConfig {
  background?: string;
  views: LovelaceViewConfig[];
}

export interface LovelaceStrategyConfig {
  strategy: Record<string, unknown>;
}

export type LovelaceRawConfig = LovelaceConfig | LovelaceStrategyConfig;

export interface CardHelpers {
  createCardElement(config: LovelaceCardConfig): LovelaceCardElement;
}

export interface LovelaceCardElement extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

export interface NavigateOptions {
  replace?: boolean;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<CardHelpers>;
  }

  interface HTMLElementTagNameMap {
    "belovodya-app": HTMLElement;
    "belovodya-layout": HTMLElement;
    "belovodya-sidebar": HTMLElement;
    "belovodya-navbar": HTMLElement;
    "belovodya-card-host": HTMLElement;
  }
}
