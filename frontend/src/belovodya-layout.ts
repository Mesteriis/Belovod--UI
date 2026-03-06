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

class BelovodyaLayout extends LitElement {
  static properties = {
    hass: { attribute: false },
    layout: { attribute: false },
    searchQuery: { type: String },
  } as const;

  static styles = css`
    ${unsafeCSS(layoutCss)}
    ${unsafeCSS(cardsCss)}
  `;

  public hass?: HomeAssistant;
  public layout?: LayoutNode;
  public searchQuery = "";

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
        class="belovodya-layout-stack"
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
      <belovodya-card-host
        class="belovodya-layout-card"
        style=${styleMap({
          "--belovodya-card-column-span": String(node.columnSpan),
          "--belovodya-card-row-span": String(node.rowSpan),
          "--belovodya-card-min-height": node.minHeight ?? "220px",
        })}
        .config=${node.config}
        .hass=${this.hass}
      ></belovodya-card-host>
    `;
  }
}

if (!customElements.get("belovodya-layout")) {
  customElements.define("belovodya-layout", BelovodyaLayout);
}
