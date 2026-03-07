import { LitElement, css, html, nothing, type TemplateResult, unsafeCSS } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";

import cardsCss from "../css/cards.css?inline";
import layoutCss from "../css/layout.css?inline";
import type {
  LayoutCardNode,
  LayoutFloatingNode,
  LayoutGridNode,
  LayoutNode,
  LayoutOverlayNode,
  LayoutStackNode,
} from "./layout-engine/layout-node";
import "./card-renderer";
import type { HomeAssistant, LovelaceCardConfig } from "./types";

const cardMatchesSearch = (config: LovelaceCardConfig, query: string): boolean => {
  if (!query) {
    return true;
  }

  const haystack = JSON.stringify({
    entity: config.entity,
    title: config.title,
    heading: config.heading,
    name: config.name,
    type: config.type,
  }).toLowerCase();

  return haystack.includes(query.toLowerCase());
};

export interface BelovodyaEditCardDetail {
  node: LayoutCardNode;
}

class BelovodyaLayout extends LitElement {
  static properties = {
    hass: { attribute: false },
    layout: { attribute: false },
    editable: { type: Boolean, reflect: true },
    searchQuery: { type: String },
  } as const;

  static styles = css`
    ${unsafeCSS(layoutCss)}
    ${unsafeCSS(cardsCss)}
  `;

  declare public hass?: HomeAssistant;
  declare public layout?: LayoutNode;
  declare public editable: boolean;
  declare public searchQuery: string;

  constructor() {
    super();
    this.editable = false;
    this.searchQuery = "";
  }

  protected override render(): TemplateResult {
    if (!this.layout) {
      return html`<div class="belovodya-empty-state">No layout is available for this dashboard.</div>`;
    }

    return html`${this._renderNode(this.layout)}`;
  }

  private _renderNode(node: LayoutNode): TemplateResult {
    switch (node.kind) {
      case "grid":
        return this._renderGrid(node);
      case "stack":
        return this._renderStack(node);
      case "overlay":
        return this._renderOverlay(node);
      case "floating":
        return this._renderFloating(node);
      case "card":
        return this._renderCard(node);
      default:
        return html`${nothing}`;
    }
  }

  private _renderGrid(node: LayoutGridNode): TemplateResult {
    return html`
      <section
        class="belovodya-layout-grid"
        style=${styleMap({
          "--belovodya-grid-columns": String(node.columns),
          "--belovodya-grid-gap": node.gap,
        })}
      >
        ${repeat(node.children, (child) => child.id, (child) => this._renderNode(child))}
      </section>
    `;
  }

  private _renderStack(node: LayoutStackNode): TemplateResult {
    return html`
      <section
        class=${`belovodya-layout-stack belovodya-layout-stack--${node.direction}`}
        style=${styleMap({
          "--belovodya-stack-gap": node.gap,
          "--belovodya-stack-direction": node.direction,
        })}
      >
        ${repeat(node.children, (child) => child.id, (child) => this._renderNode(child))}
      </section>
    `;
  }

  private _renderOverlay(node: LayoutOverlayNode): TemplateResult {
    return html`
      <section class="belovodya-layout-overlay">
        ${repeat(node.children, (child) => child.id, (child) => this._renderNode(child))}
      </section>
    `;
  }

  private _renderFloating(node: LayoutFloatingNode): TemplateResult {
    return html`
      <section
        class="belovodya-layout-floating"
        style=${styleMap({
          top: node.position.top ?? "auto",
          right: node.position.right ?? "auto",
          bottom: node.position.bottom ?? "auto",
          left: node.position.left ?? "auto",
        })}
      >
        ${this._renderNode(node.child)}
      </section>
    `;
  }

  private _renderCard(node: LayoutCardNode): TemplateResult {
    if (!cardMatchesSearch(node.config, this.searchQuery)) {
      return html`${nothing}`;
    }

    return html`
      <div
        class=${`belovodya-layout-card${this.editable ? " belovodya-layout-card--editable" : ""}`}
        style=${styleMap({
          "--belovodya-card-column-span": String(node.columnSpan),
          "--belovodya-card-row-span": String(node.rowSpan),
          "--belovodya-card-min-height": node.minHeight ?? "220px",
        })}
      >
        <belovodya-card-host
          .config=${node.config}
          .hass=${this.hass}
          .visible=${true}
        ></belovodya-card-host>
        ${this.editable
          ? html`
              <button
                class="belovodya-card-edit-chip"
                type="button"
                title="Редактировать карточку"
                @click=${(event: Event) => this._requestEdit(event, node)}
              >
                ${this._renderEditIcon()} Редактировать
              </button>
            `
          : null}
      </div>
    `;
  }

  private _requestEdit(event: Event, node: LayoutCardNode): void {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent<BelovodyaEditCardDetail>("belovodya-edit-card", {
      bubbles: true,
      composed: true,
      detail: { node },
    }));
  }

  private _renderEditIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 13.95V15.75H6.05L14.44 7.36L12.64 5.56L4.25 13.95Z"></path>
        <path d="M15.23 6.57L13.43 4.77L14.33 3.87C14.73 3.48 15.36 3.48 15.76 3.87L16.13 4.24C16.52 4.64 16.52 5.27 16.13 5.67L15.23 6.57Z"></path>
      </svg>
    `;
  }
}

if (!customElements.get("belovodya-layout")) {
  customElements.define("belovodya-layout", BelovodyaLayout);
}
