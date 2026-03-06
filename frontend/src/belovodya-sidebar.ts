import { LitElement, css, html, unsafeCSS } from "lit";
import { repeat } from "lit/directives/repeat.js";

import sidebarCss from "../css/sidebar.css?inline";
import { navigatePath } from "./belovodya-router";
import type { HANavigationItem } from "./types";

class BelovodyaSidebar extends LitElement {
  static properties = {
    items: { attribute: false },
    activePath: { type: String },
  } as const;

  static styles = css`
    ${unsafeCSS(sidebarCss)}
  `;

  public items: readonly HANavigationItem[] = Object.freeze([]);
  public activePath = "";

  protected override shouldUpdate(changedProperties: Map<PropertyKey, unknown>): boolean {
    return changedProperties.has("items") || changedProperties.has("activePath");
  }

  protected override render() {
    return html`
      <aside class="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__eyebrow">Belovodya</div>
          <div class="sidebar__title">UI Engine</div>
          <div class="sidebar__subtitle">Alternative Home Assistant shell</div>
        </div>

        <nav class="sidebar__nav" aria-label="Home Assistant navigation">
          ${repeat(
            this.items,
            (item) => item.path,
            (item) => html`
              <a
                class=${`sidebar__link${this._isActive(item.path) ? " sidebar__link--active" : ""}`}
                href=${item.path}
                title=${item.title}
                @click=${this._handleNavigate}
                data-path=${item.path}
              >
                <span class="sidebar__icon" aria-hidden="true">
                  <ha-icon .icon=${item.icon}></ha-icon>
                </span>
                <span class="sidebar__label">${item.title}</span>
              </a>
            `,
          )}
        </nav>
      </aside>
    `;
  }

  private _isActive(path: string): boolean {
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

    navigatePath(path);
  }
}

if (!customElements.get("belovodya-sidebar")) {
  customElements.define("belovodya-sidebar", BelovodyaSidebar);
}
