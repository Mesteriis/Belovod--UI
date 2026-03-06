import { LitElement, css, html, unsafeCSS } from "lit";
import { repeat } from "lit/directives/repeat.js";

import navbarCss from "../css/navbar.css?inline";

class BelovodyaNavbar extends LitElement {
  static properties = {
    breadcrumbs: { attribute: false },
    viewTitle: { type: String },
    searchQuery: { type: String },
  } as const;

  static styles = css`
    ${unsafeCSS(navbarCss)}
  `;

  public breadcrumbs: readonly string[] = Object.freeze([]);
  public viewTitle = "";
  public searchQuery = "";

  protected override shouldUpdate(changedProperties: Map<PropertyKey, unknown>): boolean {
    return (
      changedProperties.has("breadcrumbs") ||
      changedProperties.has("viewTitle") ||
      changedProperties.has("searchQuery")
    );
  }

  protected override render() {
    return html`
      <header class="navbar">
        <div class="navbar__meta">
          <nav class="navbar__breadcrumbs" aria-label="Breadcrumbs">
            ${repeat(this.breadcrumbs, (crumb, index) => `${crumb}-${index}`, (crumb) => html`
              <span class="navbar__crumb">${crumb}</span>
            `)}
          </nav>
          <div class="navbar__title">${this.viewTitle || "Belovodya"}</div>
        </div>

        <div class="navbar__controls">
          <label class="navbar__search">
            <span class="navbar__search-label">Search</span>
            <input
              class="navbar__search-input"
              type="search"
              .value=${this.searchQuery}
              placeholder="entity, card, heading"
              @input=${this._handleSearch}
            />
          </label>

          <div class="navbar__actions">
            <button class="navbar__action" type="button" @click=${this._emitRefresh}>
              Refresh
            </button>
            <button class="navbar__action navbar__action--ghost" type="button" @click=${this._emitOpenOriginal}>
              Open Lovelace
            </button>
          </div>
        </div>
      </header>
    `;
  }

  private _handleSearch(event: Event): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<string>("belovodya-search", {
        detail: target.value,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _emitRefresh(): void {
    this.dispatchEvent(
      new CustomEvent("belovodya-refresh", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _emitOpenOriginal(): void {
    this.dispatchEvent(
      new CustomEvent("belovodya-open-original", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (!customElements.get("belovodya-navbar")) {
  customElements.define("belovodya-navbar", BelovodyaNavbar);
}
