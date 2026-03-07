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

export interface PersistentNotification {
  message?: string;
  notification_id: string;
  status?: string;
  title?: string;
}

export interface RepairsIssue {
  breaks_in_ha_version?: string | null;
  domain?: string;
  issue_id?: string;
  learn_more_url?: string | null;
  severity?: string;
  translation_key?: string;
  translation_placeholders?: Record<string, string>;
}

export interface RepairsIssuesResponse {
  issues?: readonly RepairsIssue[];
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

export type HANavigationSection = "main" | "utility";
export type HANavigationActionKind = "path" | "native-click";

export interface HANavigationItem {
  id: string;
  path: string | null;
  title: string;
  icon: string;
  section: HANavigationSection;
  actionKind: HANavigationActionKind;
  nativeClass: string | null;
}

export interface LovelaceCardConfig {
  type: string;
  view_layout?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LovelaceSectionConfig {
  title?: string;
  type?: string;
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

export interface LovelaceResource {
  id: string;
  type: "css" | "js" | "module" | "html";
  url: string;
}

export interface CardHelpers {
  createBadgeElement?(config: Record<string, unknown>): HTMLElement;
  createCardElement(config: LovelaceCardConfig): LovelaceCardElement;
  createHeaderFooterElement?(config: Record<string, unknown>): HTMLElement;
  createHuiElement?(config: Record<string, unknown>): HTMLElement;
  createRowElement?(config: Record<string, unknown>): HTMLElement;
  importMoreInfoControl?(type: string): Promise<unknown>;
  showAlertDialog?(params: Record<string, unknown>): Promise<unknown>;
  showConfirmationDialog?(params: Record<string, unknown>): Promise<unknown>;
  showEnterCodeDialog?(params: Record<string, unknown>): Promise<unknown>;
  showPromptDialog?(params: Record<string, unknown>): Promise<unknown>;
}

export interface LovelaceCardElement extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceCardEditorElement extends HTMLElement {
  hass?: HomeAssistant;
  lovelace?: LovelaceConfig;
  setConfig(config: LovelaceCardConfig): void;
}

export interface LovelaceEditorChangeDetail {
  config: LovelaceCardConfig;
  error?: string;
  guiModeAvailable?: boolean;
}

export type BelovodyaLayoutVariant = "native" | "dense" | "focus" | "stack";

export interface BelovodyaLayoutVariantOption {
  value: BelovodyaLayoutVariant;
  label: string;
  description: string;
}

export interface NavigateOptions {
  replace?: boolean;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<CardHelpers>;
    customCards?: Array<Record<string, unknown>>;
  }

  interface HTMLElementTagNameMap {
    "belovodya-app": HTMLElement;
    "belovodya-layout": HTMLElement;
    "belovodya-sidebar": HTMLElement;
    "belovodya-navbar": HTMLElement;
    "belovodya-card-host": HTMLElement;
    "belovodya-card-editor-dialog": HTMLElement;
  }
}
