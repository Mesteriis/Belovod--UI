import { LitElement, css, html, nothing, type PropertyValues, unsafeCSS } from "lit";

import cardsCss from "../css/cards.css?inline";
import editorCss from "../css/editor.css?inline";
import { ensureCardHelpers } from "./lovelace-runtime";
import "./card-renderer";
import type {
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceCardEditorElement,
  LovelaceConfig,
  LovelaceEditorChangeDetail,
} from "./types";

type EditorTab = "config" | "yaml" | "layout";

const cloneConfig = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const normalizeCardLabel = (config: LovelaceCardConfig): string => String(
  config.title
  ?? config.name
  ?? config.heading
  ?? config.entity
  ?? config.type
  ?? "card",
);

const ensureViewLayout = (config: LovelaceCardConfig): Record<string, unknown> => {
  if (config.view_layout && typeof config.view_layout === "object" && !Array.isArray(config.view_layout)) {
    return { ...config.view_layout };
  }

  return {};
};

class BelovodyaCardEditorDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    hass: { attribute: false },
    lovelaceConfig: { attribute: false },
    cardConfig: { attribute: false },
    cardLabel: { type: String },
    saveHandler: { attribute: false },
    _activeTab: { state: true },
    _guiAvailable: { state: true },
    _guiError: { state: true },
    _loadingGui: { state: true },
    _saveError: { state: true },
    _saving: { state: true },
    _workingConfig: { state: true },
    _yamlValid: { state: true },
  } as const;

  static styles = css`
    ${unsafeCSS(editorCss)}
    ${unsafeCSS(cardsCss)}
  `;

  declare public open: boolean;
  declare public hass?: HomeAssistant;
  declare public lovelaceConfig?: LovelaceConfig;
  declare public cardConfig?: LovelaceCardConfig;
  declare public cardLabel: string;
  declare public saveHandler?: (config: LovelaceCardConfig) => Promise<void>;

  declare private _activeTab: EditorTab;
  declare private _guiAvailable: boolean;
  declare private _guiError: string | null;
  declare private _loadingGui: boolean;
  declare private _saveError: string | null;
  declare private _saving: boolean;
  declare private _workingConfig?: LovelaceCardConfig;
  declare private _yamlValid: boolean;
  private _editorEl?: LovelaceCardEditorElement;
  private _editorType?: string;
  private _editorLoadToken = 0;

  constructor() {
    super();
    this.open = false;
    this.cardLabel = "";
    this._activeTab = "config";
    this._guiAvailable = true;
    this._guiError = null;
    this._loadingGui = false;
    this._saveError = null;
    this._saving = false;
    this._yamlValid = true;
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if ((changedProperties.has("open") && this.open) || changedProperties.has("cardConfig")) {
      this._resetDraft();
    }
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (!this.open) {
      this._disposeEditor();
      return;
    }

    if (this._activeTab !== "config") {
      return;
    }

    if (!this._loadingGui && this._editorEl) {
      this._mountGuiEditor();
    }

    if (
      changedProperties.has("open") ||
      changedProperties.has("hass") ||
      changedProperties.has("lovelaceConfig") ||
      changedProperties.has("cardConfig") ||
      changedProperties.has("_workingConfig")
    ) {
      void this._ensureGuiEditor();
    }
  }

  disconnectedCallback(): void {
    this._disposeEditor();
    super.disconnectedCallback();
  }

  protected override render() {
    if (!this.open || !this._workingConfig) {
      return nothing;
    }

    const cardLabel = this.cardLabel || normalizeCardLabel(this._workingConfig);
    const editorUnavailable = this._guiError ?? (!this._guiAvailable ? "У этой карточки нет визуального редактора. Доступен YAML и Layout." : null);

    return html`
      <div class="belovodya-editor-backdrop" @click=${this._handleBackdropClick}></div>
      <section class="belovodya-editor" role="dialog" aria-modal="true" aria-label="Редактирование карточки">
        <header class="belovodya-editor__header">
          <div>
            <p class="belovodya-editor__eyebrow">Card Editor</p>
            <h2 class="belovodya-editor__title">${cardLabel}</h2>
            <p class="belovodya-editor__meta">Стандартный GUI editor HA используется, когда карточка его предоставляет. Иначе остаётся YAML.</p>
          </div>
          <div class="belovodya-editor__header-actions">
            <button class="belovodya-editor__icon-button" type="button" title="Закрыть" @click=${this._requestClose}>
              ${this._renderCloseIcon()}
            </button>
          </div>
        </header>

        <div class="belovodya-editor__body">
          <section class="belovodya-editor__pane">
            <div class="belovodya-editor__tabs">
              <button
                class=${`belovodya-editor__tab${this._activeTab === "config" ? " belovodya-editor__tab--active" : ""}`}
                type="button"
                @click=${() => this._setTab("config")}
              >
                Config
              </button>
              <button
                class=${`belovodya-editor__tab${this._activeTab === "layout" ? " belovodya-editor__tab--active" : ""}`}
                type="button"
                @click=${() => this._setTab("layout")}
              >
                Layout
              </button>
              <button
                class=${`belovodya-editor__tab${this._activeTab === "yaml" ? " belovodya-editor__tab--active" : ""}`}
                type="button"
                @click=${() => this._setTab("yaml")}
              >
                YAML
              </button>
            </div>

            <div class="belovodya-editor__content">
              ${this._activeTab === "config"
                ? this._loadingGui
                  ? html`<div class="belovodya-editor__state">Загружаю GUI editor Home Assistant...</div>`
                  : editorUnavailable
                    ? html`<div class="belovodya-editor__state">${editorUnavailable}</div>`
                    : html`<div id="gui-slot"></div>`
                : nothing}

              ${this._activeTab === "yaml"
                ? html`
                    <ha-yaml-editor
                      .hass=${this.hass}
                      .value=${this._workingConfig}
                      .autoUpdate=${true}
                      .inDialog=${true}
                      .disableFullscreen=${true}
                      @value-changed=${this._handleYamlChanged}
                    ></ha-yaml-editor>
                  `
                : nothing}

              ${this._activeTab === "layout"
                ? html`
                    <div class="belovodya-editor__layout-form">
                      <div class="belovodya-editor__field">
                        <label for="layout-mode">Layout mode</label>
                        <select id="layout-mode" @change=${this._handleLayoutModeChanged}>
                          ${["", "stack", "overlay", "floating"].map((value) => html`
                            <option value=${value} ?selected=${String(this._workingConfig?.view_layout?.layout ?? "") === value}>
                              ${value || "default"}
                            </option>
                          `)}
                        </select>
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="direction">Direction</label>
                        <select id="direction" @change=${(event: Event) => this._updateLayoutField("direction", (event.currentTarget as HTMLSelectElement).value || undefined)}>
                          ${["", "vertical", "horizontal"].map((value) => html`
                            <option value=${value} ?selected=${String(this._workingConfig?.view_layout?.direction ?? "") === value}>
                              ${value || "default"}
                            </option>
                          `)}
                        </select>
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="columnspan">Column span</label>
                        <input id="columnspan" type="number" min="1" .value=${String(this._workingConfig?.view_layout?.columnspan ?? "")} @input=${(event: Event) => this._updateLayoutField("columnspan", this._readNumberInput(event))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="rowspan">Row span</label>
                        <input id="rowspan" type="number" min="1" .value=${String(this._workingConfig?.view_layout?.rowspan ?? "")} @input=${(event: Event) => this._updateLayoutField("rowspan", this._readNumberInput(event))} />
                      </div>
                      <div class="belovodya-editor__field belovodya-editor__field--full">
                        <label for="min-height">Minimum height</label>
                        <input id="min-height" type="text" .value=${String(this._workingConfig?.view_layout?.min_height ?? "")} @input=${(event: Event) => this._updateLayoutField("min_height", this._readTextInput(event))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-top">Top</label>
                        <input id="pos-top" type="text" .value=${String(this._workingConfig?.view_layout?.top ?? "")} @input=${(event: Event) => this._updateLayoutField("top", this._readTextInput(event))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-right">Right</label>
                        <input id="pos-right" type="text" .value=${String(this._workingConfig?.view_layout?.right ?? "")} @input=${(event: Event) => this._updateLayoutField("right", this._readTextInput(event))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-bottom">Bottom</label>
                        <input id="pos-bottom" type="text" .value=${String(this._workingConfig?.view_layout?.bottom ?? "")} @input=${(event: Event) => this._updateLayoutField("bottom", this._readTextInput(event))} />
                      </div>
                      <div class="belovodya-editor__field">
                        <label for="pos-left">Left</label>
                        <input id="pos-left" type="text" .value=${String(this._workingConfig?.view_layout?.left ?? "")} @input=${(event: Event) => this._updateLayoutField("left", this._readTextInput(event))} />
                      </div>
                    </div>
                  `
                : nothing}
            </div>
          </section>

          <aside class="belovodya-editor__preview">
            <div class="belovodya-editor__content">
              <div class="belovodya-editor__preview-shell">
                <belovodya-card-host
                  .hass=${this.hass}
                  .config=${this._workingConfig}
                  .visible=${true}
                ></belovodya-card-host>
              </div>
            </div>
          </aside>
        </div>

        <footer class="belovodya-editor__footer">
          <div class="belovodya-editor__error">${this._saveError ?? ""}</div>
          <div class="belovodya-editor__footer-actions">
            <button class="belovodya-editor__button" type="button" @click=${this._requestClose}>Отмена</button>
            <button
              class="belovodya-editor__button belovodya-editor__button--primary"
              type="button"
              ?disabled=${this._saving || !this._yamlValid || !this._workingConfig}
              @click=${this._handleSave}
            >
              ${this._saving ? "Сохраняю..." : "Сохранить"}
            </button>
          </div>
        </footer>
      </section>
    `;
  }

  private _resetDraft(): void {
    if (!this.cardConfig) {
      this._workingConfig = undefined;
      return;
    }

    this._workingConfig = cloneConfig(this.cardConfig);
    this._activeTab = "config";
    this._guiAvailable = true;
    this._guiError = null;
    this._saveError = null;
    this._yamlValid = true;
    this._disposeEditor();
  }

  private _disposeEditor(): void {
    if (this._editorEl) {
      this._editorEl.removeEventListener("config-changed", this._handleGuiConfigChanged as EventListener);
    }
    this._editorEl = undefined;
    this._editorType = undefined;
    const slot = this.renderRoot.querySelector("#gui-slot");
    slot?.replaceChildren();
  }

  private _mountGuiEditor(): void {
    const slot = this.renderRoot.querySelector("#gui-slot");
    if (!(slot instanceof HTMLElement) || !this._editorEl) {
      return;
    }

    if (slot.firstElementChild === this._editorEl) {
      return;
    }

    slot.replaceChildren(this._editorEl);
  }

  private async _ensureGuiEditor(): Promise<void> {
    if (!this.open || !this.hass || !this._workingConfig) {
      return;
    }

    const configType = this._workingConfig.type;
    if (!configType) {
      this._guiAvailable = false;
      this._guiError = "В конфигурации карточки отсутствует type.";
      return;
    }

    if (this._editorEl && this._editorType === configType) {
      this._syncEditorState();
      return;
    }

    this._loadingGui = true;
    this._guiError = null;
    const token = ++this._editorLoadToken;

    try {
      const helpers = await ensureCardHelpers(this.hass);
      const card = helpers.createCardElement(this._workingConfig);
      const cardClass = card.constructor as { getConfigElement?: () => Promise<LovelaceCardEditorElement> | LovelaceCardEditorElement };
      if (typeof cardClass.getConfigElement !== "function") {
        this._guiAvailable = false;
        this._guiError = null;
        this._disposeEditor();
        return;
      }

      const editor = await Promise.resolve(cardClass.getConfigElement());
      if (token !== this._editorLoadToken) {
        return;
      }

      this._disposeEditor();
      this._editorEl = editor;
      this._editorType = configType;
      this._editorEl.addEventListener("config-changed", this._handleGuiConfigChanged as EventListener);
      this._guiAvailable = true;
      this._guiError = null;
      this._syncEditorState();
    } catch (error) {
      if (token !== this._editorLoadToken) {
        return;
      }
      this._guiAvailable = false;
      this._guiError = error instanceof Error ? error.message : "Не удалось открыть editor Home Assistant.";
      this._disposeEditor();
    } finally {
      if (token === this._editorLoadToken) {
        this._loadingGui = false;
      }
    }
  }

  private _syncEditorState(): void {
    if (!this._editorEl || !this.hass || !this._workingConfig) {
      return;
    }

    this._editorEl.hass = this.hass;
    if (this.lovelaceConfig && "lovelace" in this._editorEl) {
      this._editorEl.lovelace = this.lovelaceConfig;
    }
    this._editorEl.setConfig(cloneConfig(this._workingConfig));
  }

  private _handleGuiConfigChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<LovelaceEditorChangeDetail>;
    if (!customEvent.detail?.config) {
      return;
    }

    this._workingConfig = cloneConfig(customEvent.detail.config);
    this._saveError = null;
  };

  private _handleYamlChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<{ value: LovelaceCardConfig; isValid?: boolean }>;
    this._yamlValid = customEvent.detail.isValid ?? true;
    if (!customEvent.detail.value || typeof customEvent.detail.value !== "object") {
      return;
    }

    this._workingConfig = cloneConfig(customEvent.detail.value);
    this._saveError = null;
  };

  private _handleBackdropClick = (): void => {
    this._requestClose();
  };

  private _requestClose = (): void => {
    this.dispatchEvent(new CustomEvent("belovodya-editor-close", {
      bubbles: true,
      composed: true,
    }));
  };

  private _setTab(tab: EditorTab): void {
    this._activeTab = tab;
    if (tab === "config") {
      void this._ensureGuiEditor();
    }
  }

  private _handleLayoutModeChanged(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value;
    this._updateLayoutField("layout", value || undefined);
  }

  private _updateLayoutField(key: string, value: unknown): void {
    if (!this._workingConfig) {
      return;
    }

    const nextViewLayout = ensureViewLayout(this._workingConfig);
    if (value === undefined || value === null || value === "") {
      delete nextViewLayout[key];
    } else {
      nextViewLayout[key] = value;
    }

    const nextConfig: LovelaceCardConfig = {
      ...this._workingConfig,
    };

    if (Object.keys(nextViewLayout).length === 0) {
      delete nextConfig.view_layout;
    } else {
      nextConfig.view_layout = nextViewLayout;
    }

    this._workingConfig = nextConfig;
    this._saveError = null;
  }

  private _readTextInput(event: Event): string | undefined {
    const value = (event.currentTarget as HTMLInputElement).value.trim();
    return value || undefined;
  }

  private _readNumberInput(event: Event): number | undefined {
    const value = (event.currentTarget as HTMLInputElement).value.trim();
    if (!value) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private async _handleSave(): Promise<void> {
    if (!this.saveHandler || !this._workingConfig || this._saving || !this._yamlValid) {
      return;
    }

    this._saving = true;
    this._saveError = null;

    try {
      await this.saveHandler(cloneConfig(this._workingConfig));
      this._saving = false;
      this._requestClose();
    } catch (error) {
      this._saving = false;
      this._saveError = error instanceof Error ? error.message : "Не удалось сохранить карточку.";
    }
  }

  private _renderCloseIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5L15 15"></path>
        <path d="M15 5L5 15"></path>
      </svg>
    `;
  }
}

if (!customElements.get("belovodya-card-editor-dialog")) {
  customElements.define("belovodya-card-editor-dialog", BelovodyaCardEditorDialog);
}
