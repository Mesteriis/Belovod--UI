import { LitElement, css, html, unsafeCSS } from "lit";

import navbarCss from "../css/navbar.css?inline";

class BelovodyaNavbar extends LitElement {
  static properties = {
    viewTitle: { type: String },
    primaryTitle: { type: String },
    showPrimaryAction: { type: Boolean },
  } as const;

  static styles = css`
    ${unsafeCSS(navbarCss)}
  `;

  declare public viewTitle: string;
  declare public primaryTitle: string;
  declare public showPrimaryAction: boolean;

  constructor() {
    super();
    this.viewTitle = "";
    this.primaryTitle = "";
    this.showPrimaryAction = false;
  }

  protected override shouldUpdate(changedProperties: Map<PropertyKey, unknown>): boolean {
    if (!this.hasUpdated) {
      return true;
    }

    return (
      changedProperties.has("viewTitle") ||
      changedProperties.has("primaryTitle") ||
      changedProperties.has("showPrimaryAction")
    );
  }

  protected override render() {
    return html`
      <header class="navbar">
        <div class="navbar__title-pill" aria-label="Current section">
          <span class="navbar__title-icon" aria-hidden="true">${this._renderGridIcon()}</span>
          <span class="navbar__title-text">${this.viewTitle || "Главная"}</span>
        </div>

        <div class="navbar__actions" aria-label="Launcher actions">
          ${this.showPrimaryAction
            ? html`
                <button
                  class="navbar__action"
                  type="button"
                  title=${this.primaryTitle ? `Открыть ${this.primaryTitle}` : "Открыть раздел"}
                  @click=${this._emitOpenPrimary}
                >
                  <span class="navbar__action-icon" aria-hidden="true">${this._renderPlayIcon()}</span>
                </button>
              `
            : null}

          <button
            class="navbar__action navbar__action--ghost"
            type="button"
            title="Открыть Home Assistant"
            @click=${this._emitOpenHome}
          >
            <span class="navbar__action-icon" aria-hidden="true">${this._renderHomeIcon()}</span>
          </button>
        </div>
      </header>
    `;
  }

  private _emitOpenPrimary(): void {
    this.dispatchEvent(
      new CustomEvent("belovodya-open-primary", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _emitOpenHome(): void {
    this.dispatchEvent(
      new CustomEvent("belovodya-open-home", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderGridIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="5" height="5" rx="1.2"></rect>
        <rect x="12" y="3" width="5" height="5" rx="1.2"></rect>
        <rect x="3" y="12" width="5" height="5" rx="1.2"></rect>
        <rect x="12" y="12" width="5" height="5" rx="1.2"></rect>
      </svg>
    `;
  }

  private _renderPlayIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4.6C6 3.8 6.9 3.31 7.58 3.73L15.67 8.67C16.31 9.06 16.31 9.99 15.67 10.38L7.58 15.32C6.9 15.74 6 15.25 6 14.46V4.6Z"></path>
      </svg>
    `;
  }

  private _renderHomeIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 9.25L10 4.5L15.75 9.25V15.25C15.75 15.66 15.41 16 15 16H11.75V11.75H8.25V16H5C4.59 16 4.25 15.66 4.25 15.25V9.25Z"></path>
      </svg>
    `;
  }
}

if (!customElements.get("belovodya-navbar")) {
  customElements.define("belovodya-navbar", BelovodyaNavbar);
}
