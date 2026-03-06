import { LitElement, css, html, nothing, unsafeCSS } from "lit";

import animationsCss from "../css/animations.css?inline";
import layoutCss from "../css/layout.css?inline";
import themeCss from "../css/theme.css?inline";
import "./belovodya-layout";
import "./belovodya-navbar";
import { buildBelovodyaUrl, buildOriginalLovelaceUrl, navigatePath, parseBelovodyaRoute } from "./belovodya-router";
import "./belovodya-sidebar";
import {
  buildBreadcrumbs,
  extractNavigationItems,
  fetchLovelaceConfig,
  parseLovelaceDashboard,
  resolveViewForPath,
  type BelovodyaParsedDashboard,
  type BelovodyaParsedView,
} from "./lovelace-parser";
import type {
  BelovodyaPanelInfo,
  BelovodyaPanelRuntimeConfig,
  HANavigationItem,
  HomeAssistant,
  Route,
} from "./types";

const applyScrollLock = (): (() => void) => {
  const previousBodyOverflow = document.body.style.overflow;
  const previousHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousHtmlOverflow;
  };
};

class BelovodyaApp extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    panel: { attribute: false },
    route: { attribute: false },
    _activeView: { state: true },
    _dashboard: { state: true },
    _error: { state: true },
    _loading: { state: true },
    _navigation: { state: true },
    _searchQuery: { state: true },
  } as const;

  static styles = css`
    ${unsafeCSS(themeCss)}
    ${unsafeCSS(layoutCss)}
    ${unsafeCSS(animationsCss)}
  `;

  public hass?: HomeAssistant;
  public narrow = false;
  public panel?: BelovodyaPanelInfo;
  public route?: Route;

  private _activeView?: BelovodyaParsedView;
  private _dashboard?: BelovodyaParsedDashboard;
  private _dashboardPath: string | null = null;
  private _error?: string;
  private _loading = false;
  private _navigation: readonly HANavigationItem[] = Object.freeze([]);
  private _searchQuery = "";
  private _restoreScroll?: () => void;
  private _loadTask?: Promise<void>;

  connectedCallback(): void {
    super.connectedCallback();
    this._restoreScroll = applyScrollLock();
  }

  disconnectedCallback(): void {
    this._restoreScroll?.();
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("hass") && this.hass) {
      this._navigation = extractNavigationItems(this.hass);
    }

    if ((changedProperties.has("hass") || changedProperties.has("panel")) && this.hass && this.panel) {
      void this._initializeDashboard();
      return;
    }

    if (changedProperties.has("route") && this._dashboard && this.panel) {
      this._syncRoute(this._dashboard, this.panel.config);
    }
  }

  protected override render() {
    const activePath = window.location.pathname;
    const breadcrumbs = this._dashboard && this._activeView
      ? buildBreadcrumbs(this._dashboard, this._activeView)
      : Object.freeze(["Belovodya"]);

    return html`
      <belovodya-sidebar
        class="sidebar"
        .items=${this._navigation}
        .activePath=${activePath}
      ></belovodya-sidebar>

      <belovodya-navbar
        class="navbar"
        .breadcrumbs=${breadcrumbs}
        .viewTitle=${this._activeView?.title ?? "Belovodya UI Engine"}
        .searchQuery=${this._searchQuery}
        @belovodya-search=${this._handleSearch}
        @belovodya-refresh=${this._handleRefresh}
        @belovodya-open-original=${this._handleOpenOriginal}
      ></belovodya-navbar>

      <main class="main" data-belovodya-scroll-root>
        ${this._error
          ? html`<section class="belovodya-status belovodya-status--error">${this._error}</section>`
          : nothing}

        ${this._loading
          ? html`<section class="belovodya-status belovodya-status--loading">Loading Belovodya dashboard…</section>`
          : nothing}

        ${!this._loading && this._activeView
          ? html`
              <belovodya-layout
                .hass=${this.hass}
                .layout=${this._activeView.layout}
                .searchQuery=${this._searchQuery}
              ></belovodya-layout>
            `
          : nothing}

        ${!this._loading && !this._activeView && !this._error
          ? html`<section class="belovodya-status">No Lovelace view is available.</section>`
          : nothing}
      </main>
    `;
  }

  private async _initializeDashboard(force = false): Promise<void> {
    if (!this.hass || !this.panel) {
      return;
    }

    if (this._loadTask && !force) {
      return this._loadTask;
    }

    const panelConfig = this.panel.config as BelovodyaPanelRuntimeConfig;
    const routeState = parseBelovodyaRoute(this.route ?? { path: "", prefix: "" }, panelConfig);

    if (!force && this._dashboard && this._dashboardPath === routeState.dashboardPath) {
      this._syncRoute(this._dashboard, panelConfig);
      return;
    }

    this._loadTask = (async () => {
      this._loading = true;
      this._error = undefined;

      try {
        const config = await fetchLovelaceConfig(this.hass as HomeAssistant, routeState.dashboardPath);
        const dashboard = parseLovelaceDashboard(config, routeState.dashboardPath);
        this._dashboard = dashboard;
        this._dashboardPath = routeState.dashboardPath;
        this._navigation = extractNavigationItems(this.hass as HomeAssistant);
        this._syncRoute(dashboard, panelConfig);
      } catch (error: unknown) {
        this._error = error instanceof Error ? error.message : "Unable to load Lovelace dashboard";
        this._activeView = undefined;
      } finally {
        this._loading = false;
        this._loadTask = undefined;
      }
    })();

    return this._loadTask;
  }

  private _syncRoute(
    dashboard: BelovodyaParsedDashboard,
    panelConfig: BelovodyaPanelRuntimeConfig,
  ): void {
    const routeState = parseBelovodyaRoute(this.route ?? { path: "", prefix: "" }, panelConfig);

    if (routeState.dashboardPath !== this._dashboardPath) {
      void this._initializeDashboard(true);
      return;
    }

    const view = resolveViewForPath(dashboard, routeState.viewPath);
    this._activeView = view;

    if (view && routeState.viewPath !== view.key) {
      navigatePath(
        buildBelovodyaUrl(panelConfig.panel_url_path, view.key, routeState.dashboardPath),
        { replace: true },
      );
    }
  }

  private _handleSearch(event: CustomEvent<string>): void {
    this._searchQuery = event.detail;
  }

  private _handleRefresh(): void {
    void this._initializeDashboard(true);
  }

  private _handleOpenOriginal(): void {
    navigatePath(buildOriginalLovelaceUrl(this._dashboardPath, this._activeView?.key ?? null));
  }
}

if (!customElements.get("belovodya-app")) {
  customElements.define("belovodya-app", BelovodyaApp);
}
