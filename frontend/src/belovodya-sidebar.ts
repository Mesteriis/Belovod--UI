import { LitElement, css, html, unsafeCSS } from "lit";
import { repeat } from "lit/directives/repeat.js";

import sidebarCss from "../css/sidebar.css?inline";
import { navigatePath, navigateToPanelPath } from "./belovodya-router";
import type { HANavigationItem } from "./types";

class BelovodyaSidebar extends LitElement {
  static properties = {
    items: { attribute: false },
    activePath: { type: String },
  } as const;

  static styles = css`
    ${unsafeCSS(sidebarCss)}
  `;

  declare public items: readonly HANavigationItem[];
  declare public activePath: string;

  constructor() {
    super();
    this.items = Object.freeze([]);
    this.activePath = "";
  }

  protected override shouldUpdate(changedProperties: Map<PropertyKey, unknown>): boolean {
    if (!this.hasUpdated) {
      return true;
    }

    return changedProperties.has("items") || changedProperties.has("activePath");
  }

  protected override render() {
    const activeItem = this.items.find((item) => this._isActive(item.path));

    return html`
      <aside class="sidebar">
        <div class="sidebar__content">
          <section class="sidebar__brand" aria-label="Око">
            <img
              class="sidebar__brand-mark"
              src="/belovodya_ui_static/img/emblem-mark.png"
              alt=""
              aria-hidden="true"
            />
            <div class="sidebar__brand-copy">
              <div class="sidebar__brand-title">Око</div>
              <div class="sidebar__brand-subtitle">Your Infrastructure in Sight</div>
            </div>
            <button
              class="sidebar__brand-tool"
              type="button"
              title="Открыть Belovodya"
              @click=${() => navigatePath("/belovodya")}
            >
              <span aria-hidden="true">${this._renderPanelIcon()}</span>
            </button>
          </section>

          <section class="sidebar__links" aria-label="Quick actions">
            <button
              class="sidebar__shortcut${this._isActive("/belovodya") ? " sidebar__shortcut--active" : ""}"
              type="button"
              title="Belovodya"
              @click=${() => navigatePath("/belovodya")}
            >
              <span aria-hidden="true">${this._renderEyeIcon()}</span>
            </button>
          </section>

          <section class="sidebar__nav-card" aria-label="Home Assistant navigation launcher">
            <div class="sidebar__nav-topline">
              <div class="sidebar__nav-title-wrap">
                <span class="sidebar__nav-caret" aria-hidden="true">▾</span>
                <h2 class="sidebar__nav-title">Home Assistant</h2>
              </div>
              <span class="sidebar__nav-chip">${this.items.length}</span>
            </div>

            <nav class="sidebar__nav">
              ${this.items.length > 0
                ? repeat(
                    this.items,
                    (item) => item.id,
                    (item) => html`
                      <a
                        class=${`sidebar__node${this._isActive(item.path) ? " sidebar__node--active" : ""}`}
                        href=${item.path ?? "#"}
                        title=${item.title}
                        @click=${this._handleNavigate}
                        data-path=${item.path ?? ""}
                      >
                        <span class="sidebar__node-icon" aria-hidden="true">
                          <ha-icon .icon=${item.icon}></ha-icon>
                        </span>
                        <span class="sidebar__node-text">${item.title}</span>
                        ${this._isActive(item.path)
                          ? html`<span class="sidebar__node-meta">active</span>`
                          : null}
                      </a>
                    `,
                  )
                : html`<div class="sidebar__empty">Панели Home Assistant пока не обнаружены.</div>`}
            </nav>
          </section>

          <section class="sidebar__status" aria-label="Launcher status">
            <div class="sidebar__status-label">Индикаторы</div>
            <div class="sidebar__status-value">
              ${this.items.length} панелей${activeItem ? html` · ${activeItem.title}` : html` · Launcher shell`}
            </div>
          </section>
        </div>
      </aside>
    `;
  }

  private _isActive(path: string | null): boolean {
    if (!path) {
      return false;
    }

    return this.activePath === path || this.activePath.startsWith(`${path}/`);
  }

  private _handleNavigate(event: Event): void {
    event.preventDefault();
    const currentTarget = event.currentTarget;
    if (!(currentTarget instanceof HTMLElement)) {
      return;
    }

    const path = currentTarget.dataset.path;
    if (!path) {
      return;
    }

    console.info("[Belovodya UI] navigation click", { path });
    navigateToPanelPath(path);
  }

  private _renderPanelIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4.25H14C14.41 4.25 14.75 4.59 14.75 5V15C14.75 15.41 14.41 15.75 14 15.75H6C5.59 15.75 5.25 15.41 5.25 15V5C5.25 4.59 5.59 4.25 6 4.25Z"></path>
        <path d="M10.75 7.25H12.75V12.75H10.75"></path>
      </svg>
    `;
  }

  private _renderEyeIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 10C4.06 7.36 6.71 5.75 10 5.75C13.29 5.75 15.94 7.36 17.5 10C15.94 12.64 13.29 14.25 10 14.25C6.71 14.25 4.06 12.64 2.5 10Z"></path>
        <circle cx="10" cy="10" r="2.1"></circle>
      </svg>
    `;
  }
}

if (!customElements.get("belovodya-sidebar")) {
  customElements.define("belovodya-sidebar", BelovodyaSidebar);
}
