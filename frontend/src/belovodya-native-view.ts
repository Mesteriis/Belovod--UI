import { LitElement, css, html } from "lit";

import type { HomeAssistant, LovelaceConfig } from "./types";

interface LovelaceRuntimeContext {
  config: LovelaceConfig;
  rawConfig: LovelaceConfig;
  mode: "storage";
  urlPath: string | null;
  editMode: boolean;
  locale: string;
  enableFullEditMode: () => void;
  setEditMode: (_editMode: boolean) => void;
  saveConfig: (_config: LovelaceConfig) => Promise<void>;
  deleteConfig: () => Promise<void>;
  showToast: (_params: { message: string }) => void;
}

class BelovodyaNativeView extends LitElement {
  static properties = {
    hass: { attribute: false },
    config: { attribute: false },
    dashboardPath: { type: String, attribute: "dashboard-path" },
    viewIndex: { type: Number, attribute: "view-index" },
    narrow: { type: Boolean },
  } as const;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 100%;
    }

    .belovodya-native-view {
      display: block;
      height: 100%;
      min-height: 100%;
    }

    hui-view {
      display: block;
      height: 100%;
      min-height: 100%;
    }
  `;

  declare public hass?: HomeAssistant;
  declare public config?: LovelaceConfig;
  declare public dashboardPath: string | null;
  declare public viewIndex: number;
  declare public narrow: boolean;

  private _viewEl?: (HTMLElement & {
    hass?: HomeAssistant;
    lovelace?: LovelaceRuntimeContext;
    narrow?: boolean;
    index?: number;
  }) | undefined;

  constructor() {
    super();
    this.dashboardPath = null;
    this.viewIndex = 0;
    this.narrow = false;
  }

  protected override render() {
    return html`<div class="belovodya-native-view"></div>`;
  }

  protected override firstUpdated(): void {
    this._ensureNativeView();
  }

  protected override updated(): void {
    this._ensureNativeView();
    this._syncNativeView();
  }

  private _ensureNativeView(): void {
    if (this._viewEl) {
      return;
    }

    const viewCtor = customElements.get("hui-view");
    const mount = this.renderRoot.querySelector(".belovodya-native-view");
    if (!viewCtor || !(mount instanceof HTMLElement)) {
      return;
    }

    this._viewEl = document.createElement("hui-view") as HTMLElement & {
      hass?: HomeAssistant;
      lovelace?: LovelaceRuntimeContext;
      narrow?: boolean;
      index?: number;
    };
    mount.replaceChildren(this._viewEl);
  }

  private _syncNativeView(): void {
    if (!this._viewEl || !this.hass || !this.config) {
      return;
    }

    this._viewEl.hass = this.hass;
    this._viewEl.narrow = this.narrow;
    this._viewEl.index = this.viewIndex;
    this._viewEl.lovelace = {
      config: this.config,
      rawConfig: this.config,
      mode: "storage",
      urlPath: this.dashboardPath,
      editMode: false,
      locale: this.hass.language,
      enableFullEditMode: () => undefined,
      setEditMode: () => undefined,
      saveConfig: async () => undefined,
      deleteConfig: async () => undefined,
      showToast: () => undefined,
    };
  }
}

if (!customElements.get("belovodya-native-view")) {
  customElements.define("belovodya-native-view", BelovodyaNativeView);
}
