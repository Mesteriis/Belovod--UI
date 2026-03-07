import { LitElement, css, html, unsafeCSS } from "lit";
import { repeat } from "lit/directives/repeat.js";

import animationsCss from "../css/animations.css?inline";
import layoutCss from "../css/layout.css?inline";
import navbarCss from "../css/navbar.css?inline";
import notificationsCss from "../css/notifications.css?inline";
import { buildOriginalLovelaceUrl, navigateToPanelPath, parseBelovodyaRoute } from "./belovodya-router";
import { restoreNativeShell, suppressNativeShell } from "./ha-shell";
import { extractSidebarSnapshot, sameSidebarSnapshot, triggerNativeSidebarAction, type HASidebarSnapshot } from "./ha-sidebar";
import sidebarCss from "../css/sidebar.css?inline";
import themeCss from "../css/theme.css?inline";
import { emptyNotificationsSnapshot, fetchBelovodyaNotifications, type BelovodyaNotificationItem, type BelovodyaNotificationsSnapshot } from "./notifications";
import { initSidebarParticles, resetSidebarParticles } from "./tsparticles";
import { fetchLovelaceConfig, parseLovelaceDashboard, resolveViewForPath, type BelovodyaParsedDashboard, type BelovodyaParsedView } from "./lovelace-parser";
import { ensureLovelaceResourcesLoaded } from "./lovelace-runtime";
import type { LayoutCardNode } from "./layout-engine/layout-node";
import { LAYOUT_VARIANT_OPTIONS, transformLayoutVariant } from "./layout-engine/layout-variants";
import type { LayoutNode } from "./layout-engine/layout-node";
import "./belovodya-layout";
import "./belovodya-card-editor";
import "./belovodya-native-view";
import type {
  BelovodyaLayoutVariant,
  BelovodyaPanelInfo,
  BelovodyaPanelRuntimeConfig,
  HANavigationItem,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceConfig,
  Route,
} from "./types";

const DEV_LOGGING = true;
const NOTIFICATIONS_REFRESH_TTL = 30_000;
const SIDEBAR_COLLAPSED_STORAGE_KEY = "belovodya-ui:sidebar-collapsed";
const LAYOUT_VARIANT_STORAGE_KEY = "belovodya-ui:layout-variant";
const DEFAULT_PANEL_CONFIG: BelovodyaPanelRuntimeConfig = Object.freeze({
  default_dashboard: null,
  engine_version: "dev",
  panel_url_path: "belovodya",
  sidebar_title: "Belovodya",
  sidebar_icon: "mdi:view-dashboard-outline",
  require_admin: false,
});

const EMPTY_SIDEBAR_SNAPSHOT: HASidebarSnapshot = Object.freeze({
  main: Object.freeze([]),
  utility: Object.freeze([]),
});

const debugLog = (label: string, payload: unknown): void => {
  if (!DEV_LOGGING) {
    return;
  }

  console.info(`[Belovodya UI] ${label}`, payload);
};

const roundMetric = (value: number): number => Math.round(value * 100) / 100;

const measureElement = (element: Element | null): Record<string, number> | null => {
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  return {
    width: roundMetric(rect.width),
    height: roundMetric(rect.height),
    top: roundMetric(rect.top),
    left: roundMetric(rect.left),
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight,
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
  };
};

const inspectElement = (element: Element | null): Record<string, unknown> | null => {
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const style = window.getComputedStyle(element);
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || null,
    className: element.className || null,
    rect: measureElement(element),
    display: style.display,
    position: style.position,
    overflow: style.overflow,
    padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
    margin: `${style.marginTop} ${style.marginRight} ${style.marginBottom} ${style.marginLeft}`,
  };
};

const inspectParentChain = (element: Element | null, depth = 5): readonly Record<string, unknown>[] => {
  const chain: Record<string, unknown>[] = [];
  let current: Element | null = element;

  for (let index = 0; index < depth && current; index += 1) {
    const snapshot = inspectElement(current);
    if (snapshot) {
      chain.push(snapshot);
    }
    current = current.parentElement;
  }

  return chain;
};

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

const readCollapsedPreference = (): boolean => {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const writeCollapsedPreference = (collapsed: boolean): void => {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    // ignore storage failures in private contexts
  }
};

const readLayoutVariantPreference = (): BelovodyaLayoutVariant => {
  try {
    const value = window.localStorage.getItem(LAYOUT_VARIANT_STORAGE_KEY);
    return LAYOUT_VARIANT_OPTIONS.some((option) => option.value === value)
      ? value as BelovodyaLayoutVariant
      : "native";
  } catch {
    return "native";
  }
};

const writeLayoutVariantPreference = (variant: BelovodyaLayoutVariant): void => {
  try {
    window.localStorage.setItem(LAYOUT_VARIANT_STORAGE_KEY, variant);
  } catch {
    // ignore storage failures in private contexts
  }
};

const cloneConfig = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const updateCardConfigAtPath = (
  config: LovelaceConfig,
  viewIndex: number,
  path: readonly (string | number)[],
  nextCardConfig: LovelaceCardConfig,
): LovelaceConfig => {
  const nextConfig = cloneConfig(config);
  const nextViews = nextConfig.views ?? [];
  const nextView = nextViews[viewIndex];
  if (!nextView) {
    throw new Error("Belovodya UI could not resolve the target Lovelace view.");
  }

  let cursor: Record<string, unknown> = nextView as unknown as Record<string, unknown>;
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    if (typeof segment === "number") {
      cursor = (cursor as unknown as unknown[])[segment] as Record<string, unknown>;
    } else {
      cursor = cursor[segment] as Record<string, unknown>;
    }

    if (!cursor) {
      throw new Error("Belovodya UI failed to resolve nested card path.");
    }
  }

  const lastSegment = path[path.length - 1];
  if (typeof lastSegment === "number") {
    (cursor as unknown as LovelaceCardConfig[])[lastSegment] = nextCardConfig;
  } else {
    cursor[lastSegment] = nextCardConfig;
  }

  return nextConfig;
};

const cardLabelFromConfig = (config: LovelaceCardConfig): string => String(
  config.title
  ?? config.name
  ?? config.heading
  ?? config.entity
  ?? config.type
  ?? "card",
);

const layoutContainsCustomCards = (node: LayoutNode | undefined): boolean => {
  if (!node) {
    return false;
  }

  switch (node.kind) {
    case "card":
      return String(node.config.type ?? "").startsWith("custom:");
    case "grid":
    case "stack":
    case "overlay":
      return node.children.some((child) => layoutContainsCustomCards(child));
    case "floating":
      return layoutContainsCustomCards(node.child);
    default:
      return false;
  }
};

class BelovodyaApp extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    panel: { attribute: false },
    route: { attribute: false },
    sidebarCollapsed: { type: Boolean, reflect: true, attribute: "sidebar-collapsed" },
    _activeView: { state: true },
    _dashboard: { state: true },
    _dashboardError: { state: true },
    _dashboardLoading: { state: true },
    _editMode: { state: true },
    _editorCard: { state: true },
    _layoutVariant: { state: true },
    _notificationsError: { state: true },
    _notificationsLoading: { state: true },
    _notificationsOpen: { state: true },
    _notificationsSnapshot: { state: true },
    _sidebarSnapshot: { state: true },
  } as const;

  static styles = css`
    ${unsafeCSS(themeCss)}
    ${unsafeCSS(layoutCss)}
    ${unsafeCSS(sidebarCss)}
    ${unsafeCSS(navbarCss)}
    ${unsafeCSS(notificationsCss)}
    ${unsafeCSS(animationsCss)}
  `;

  declare public hass?: HomeAssistant;
  declare public narrow: boolean;
  declare public panel?: BelovodyaPanelInfo;
  declare public route?: Route;
  declare public sidebarCollapsed: boolean;

  declare private _activeView?: BelovodyaParsedView;
  declare private _dashboard?: BelovodyaParsedDashboard;
  declare private _dashboardError: string | null;
  declare private _dashboardLoading: boolean;
  declare private _editMode: boolean;
  declare private _editorCard?: LayoutCardNode;
  declare private _layoutVariant: BelovodyaLayoutVariant;
  declare private _notificationsError: string | null;
  declare private _notificationsLoading: boolean;
  declare private _notificationsOpen: boolean;
  declare private _notificationsSnapshot: BelovodyaNotificationsSnapshot;
  declare private _sidebarSnapshot: HASidebarSnapshot;

  private _dashboardLoadToken = 0;
  private _restoreScroll?: () => void;
  private _resizeObserver?: ResizeObserver;
  private _sidebarBootstrapTimers: number[] = [];

  constructor() {
    super();
    this.narrow = false;
    this.sidebarCollapsed = readCollapsedPreference();
    this._dashboardError = null;
    this._dashboardLoading = false;
    this._editMode = false;
    this._layoutVariant = readLayoutVariantPreference();
    this._notificationsError = null;
    this._notificationsLoading = false;
    this._notificationsOpen = false;
    this._notificationsSnapshot = emptyNotificationsSnapshot();
    this._sidebarSnapshot = EMPTY_SIDEBAR_SNAPSHOT;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._restoreScroll = applyScrollLock();
    window.addEventListener("keydown", this._handleWindowKeydown);
    window.requestAnimationFrame(() => {
      suppressNativeShell();
    });
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    this._clearSidebarBootstrapTimers();
    window.removeEventListener("keydown", this._handleWindowKeydown);
    restoreNativeShell();
    this._restoreScroll?.();
    resetSidebarParticles(this.renderRoot.querySelector(".sidebar-particles") as HTMLElement | null);
    super.disconnectedCallback();
  }

  protected override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("sidebarCollapsed")) {
      writeCollapsedPreference(this.sidebarCollapsed);
    }

    if (changedProperties.has("_layoutVariant")) {
      writeLayoutVariantPreference(this._layoutVariant);
    }

    if (this.hass) {
      const nextSnapshot = extractSidebarSnapshot(this.hass);
      if (changedProperties.has("hass") || !sameSidebarSnapshot(this._sidebarSnapshot, nextSnapshot)) {
        this._syncSidebarSnapshot(nextSnapshot);
      }
    }
  }

  protected override firstUpdated(): void {
    const elements = [
      this,
      this.renderRoot.querySelector(".sidebar"),
      this.renderRoot.querySelector(".navbar"),
      this.renderRoot.querySelector(".main"),
      this.renderRoot.querySelector(".dashboard-stage"),
    ];

    const logMetrics = () => {
      debugLog("shell metrics", {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        host: measureElement(this),
        sidebar: measureElement(this.renderRoot.querySelector(".sidebar")),
        navbar: measureElement(this.renderRoot.querySelector(".navbar")),
        main: measureElement(this.renderRoot.querySelector(".main")),
        canvas: measureElement(this.renderRoot.querySelector(".dashboard-stage")),
        hostChain: inspectParentChain(this),
      });
    };

    this._resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(logMetrics);
    });

    for (const element of elements) {
      if (element instanceof Element) {
        this._resizeObserver.observe(element);
      }
    }

    if (this.hass) {
      this._syncSidebarSnapshot(extractSidebarSnapshot(this.hass));
      void ensureLovelaceResourcesLoaded(this.hass);
      void this._syncDashboard();
    }

    suppressNativeShell();
    void initSidebarParticles(this.renderRoot.querySelector(".sidebar-particles") as HTMLElement | null);
    this._scheduleSidebarBootstrapRefresh();
    window.requestAnimationFrame(logMetrics);
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("route")) {
      debugLog("route state", {
        route: this.route,
        location: window.location.pathname,
      });
    }

    if (changedProperties.has("hass") || changedProperties.has("route") || changedProperties.has("panel")) {
      void this._syncDashboard();
    }

    if (changedProperties.has("sidebarCollapsed")) {
      void initSidebarParticles(this.renderRoot.querySelector(".sidebar-particles") as HTMLElement | null);
    }
  }

  protected override render() {
    const activePath = window.location.pathname;
    const navigation = this._sidebarSnapshot.main;
    const utilityItems = this._sidebarSnapshot.utility;
    const orderedNavigation = this._prioritizeActiveNavigation(activePath, navigation);
    const activeSidebarItem = this._resolveActiveItem(activePath, navigation);
    const totalNotifications = this._notificationsSnapshot.notifications.length + this._notificationsSnapshot.issues.length;
    const contentTitle = this._activeView?.title ?? activeSidebarItem?.title ?? "Belovodya";
    const runtimeNeedsWarmup = typeof window.loadCardHelpers !== "function";
    const activeLayout = this._activeView ? transformLayoutVariant(this._activeView.layout, this._layoutVariant) : undefined;
    const activeViewHasCustomCards = layoutContainsCustomCards(this._activeView?.layout);
    const useNativeViewHost = this._layoutVariant === "native" || activeViewHasCustomCards;

    return html`
      <aside class=${`sidebar${this.sidebarCollapsed ? " sidebar--collapsed" : ""}`}>
        <div class="sidebar__content">
          <div class="sidebar-particles" aria-hidden="true"></div>

          <button
            class="sidebar__brand"
            type="button"
            title=${this.sidebarCollapsed ? "Развернуть панель" : "Скрыть панель"}
            aria-label=${this.sidebarCollapsed ? "Развернуть панель" : "Скрыть панель"}
            @click=${this._toggleSidebarCollapsed}
          >
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
          </button>

          <section class="sidebar__nav-card" aria-label="Home Assistant navigation launcher">
            <nav class="sidebar__nav">
              ${orderedNavigation.length > 0
                ? repeat(
                    orderedNavigation,
                    (item) => item.id,
                    (item) => html`
                      <a
                        class=${`sidebar__node${this._isActivePath(item.path, activePath) ? " sidebar__node--active" : ""}`}
                        href=${item.path ?? "#"}
                        title=${item.title}
                        @click=${(event: Event) => this._handleNavigationClick(event, item)}
                      >
                        <span class="sidebar__node-icon" aria-hidden="true">
                          <ha-icon .icon=${item.icon}></ha-icon>
                        </span>
                        <span class="sidebar__node-text">${item.title}</span>
                        ${this._isActivePath(item.path, activePath)
                          ? html`<span class="sidebar__node-meta">active</span>`
                          : null}
                      </a>
                    `,
                  )
                : html`<div class="sidebar__empty">Панели Home Assistant пока не обнаружены.</div>`}
            </nav>
          </section>

          <section class="sidebar__status" aria-label="System actions">
            <div class="sidebar__status-actions">
              ${repeat(
                utilityItems,
                (item) => item.id,
                (item) => html`
                  <button
                    class="sidebar__utility"
                    type="button"
                    title=${item.title}
                    aria-pressed=${item.nativeClass === "notifications" ? String(this._notificationsOpen) : "false"}
                    @click=${() => this._handleUtilityAction(item)}
                  >
                    <span class="sidebar__utility-icon" aria-hidden="true">
                      <ha-icon .icon=${item.icon}></ha-icon>
                    </span>
                    <span class="sidebar__utility-text">${item.title}</span>
                    ${item.nativeClass === "notifications" && totalNotifications > 0 && !this.sidebarCollapsed
                      ? html`<span class="sidebar__node-meta">${totalNotifications}</span>`
                      : null}
                  </button>
                `,
              )}
            </div>
          </section>
        </div>
      </aside>

      <main class="main" data-belovodya-scroll-root>
        <header class="navbar">
          <div class="navbar__title-pill" aria-label="Current section">
            <span class="navbar__title-icon" aria-hidden="true">${this._renderGridIcon()}</span>
            <span class="navbar__title-text">${contentTitle}</span>
          </div>

          <div class="navbar__actions" aria-label="Belovodya dashboard actions">
            <label class="navbar__layout-select-shell">
              <span class="navbar__layout-select-icon" aria-hidden="true">${this._renderLayoutIcon()}</span>
              <select class="navbar__layout-select" .value=${this._layoutVariant} @change=${this._handleLayoutVariantChange}>
                ${LAYOUT_VARIANT_OPTIONS.map((option) => html`
                  <option value=${option.value}>${option.label}</option>
                `)}
              </select>
            </label>

            <button
              class=${`navbar__action${this._editMode ? " navbar__action--active" : ""}`}
              type="button"
              title=${this._editMode ? "Выключить режим редактирования" : "Включить режим редактирования"}
              @click=${this._toggleEditMode}
            >
              <span class="navbar__action-icon" aria-hidden="true">${this._renderEditIcon()}</span>
            </button>

            <button
              class="navbar__action navbar__action--ghost"
              type="button"
              title="Открыть исходный Lovelace dashboard"
              @click=${this._handleOpenOriginalDashboard}
            >
              <span class="navbar__action-icon" aria-hidden="true">${this._renderHomeIcon()}</span>
            </button>
          </div>
        </header>

        <section class="dashboard-stage" aria-label="Belovodya dashboard canvas">
          ${runtimeNeedsWarmup
            ? html`
                <div class="dashboard-warning">
                  <div class="dashboard-warning__title">Lovelace runtime ещё не прогрет</div>
                  <div class="dashboard-warning__copy">
                    Стандартные HA card helpers загружаются лениво. Открой исходный dashboard один раз, затем вернись в Belovodya.
                  </div>
                  <button class="launcher-panel__button" type="button" @click=${this._handleOpenOriginalDashboard}>
                    Открыть исходный dashboard
                  </button>
                </div>
              `
            : null}

          ${activeViewHasCustomCards && this._layoutVariant !== "native"
            ? html`
                <div class="dashboard-warning">
                  <div class="dashboard-warning__title">Layout variant временно отключён</div>
                  <div class="dashboard-warning__copy">
                    В этой view есть custom cards. Для совместимости Belovodya использует нативный Lovelace renderer вместо ручной пересборки layout.
                  </div>
                </div>
              `
            : null}

          ${this._dashboardLoading
            ? html`<div class="dashboard-state">Читаю Lovelace dashboard config...</div>`
            : this._dashboardError
              ? html`
                  <div class="dashboard-state dashboard-state--error">
                    <div class="dashboard-state__title">Не удалось загрузить dashboard</div>
                    <div>${this._dashboardError}</div>
                  </div>
                `
              : this._activeView && (activeLayout || useNativeViewHost)
                ? html`
                    ${this._editMode && !useNativeViewHost
                      ? html`
                          <div class="dashboard-edit-banner">
                            <div class="dashboard-edit-banner__title">Edit mode</div>
                            <div class="dashboard-edit-banner__copy">
                              Выбери карточку в main area. Откроется editor с GUI, если его предоставляет стандартная или кастомная карточка.
                            </div>
                          </div>
                        `
                      : null}
                    ${useNativeViewHost
                      ? html`
                          <belovodya-native-view
                            .hass=${this.hass}
                            .config=${this._dashboard?.raw}
                            .dashboardPath=${this._dashboard?.dashboardPath ?? null}
                            .viewIndex=${this._activeView.index}
                            .narrow=${this.narrow}
                          ></belovodya-native-view>
                        `
                      : html`
                          <belovodya-layout
                            .hass=${this.hass}
                            .layout=${activeLayout}
                            .editable=${this._editMode}
                            @belovodya-edit-card=${this._handleEditCardRequest}
                          ></belovodya-layout>
                        `}
                  `
                : html`
                    <div class="dashboard-state">
                      <div class="dashboard-state__title">В dashboard нет доступных views</div>
                      <div>Belovodya не получил ни одной Lovelace view для рендера.</div>
                    </div>
                  `}
        </section>
      </main>

      <div
        class=${`notifications-backdrop${this._notificationsOpen ? " notifications-backdrop--open" : ""}`}
        @click=${this._closeNotificationsDrawer}
      ></div>

      <aside
        class=${`notifications-drawer${this._notificationsOpen ? " notifications-drawer--open" : ""}`}
        aria-hidden=${String(!this._notificationsOpen)}
      >
        <header class="notifications-drawer__header">
          <div>
            <p class="notifications-drawer__eyebrow">Системные уведомления</p>
            <h2 class="notifications-drawer__title">Уведомления</h2>
            <p class="notifications-drawer__meta">
              ${this._notificationsLoading
                ? "Загружаю уведомления Home Assistant..."
                : `${this._notificationsSnapshot.issues.length} repairs · ${this._notificationsSnapshot.notifications.length} persistent`}
            </p>
          </div>
          <div class="notifications-drawer__header-actions">
            <button
              class="notifications-drawer__button notifications-drawer__button--ghost"
              type="button"
              title="Обновить"
              @click=${this._refreshNotificationsClick}
            >
              Обновить
            </button>
            <button
              class="notifications-drawer__button"
              type="button"
              title="Закрыть"
              @click=${this._closeNotificationsDrawer}
            >
              Закрыть
            </button>
          </div>
        </header>

        <div class="notifications-drawer__body">
          ${this._notificationsLoading
            ? html`<div class="notifications-drawer__state">Получаю системные уведомления из Home Assistant.</div>`
            : this._notificationsError
              ? html`<div class="notifications-drawer__state">${this._notificationsError}</div>`
              : this._notificationsSnapshot.issues.length === 0 && this._notificationsSnapshot.notifications.length === 0
                ? html`
                    <div class="notifications-drawer__empty">
                      <div class="notifications-drawer__empty-icon" aria-hidden="true">${this._renderBellIcon()}</div>
                      <div class="notifications-drawer__empty-title">Нет уведомлений</div>
                      <div class="notifications-drawer__empty-copy">
                        В Home Assistant сейчас нет активных persistent notifications и repairs issues.
                      </div>
                    </div>
                  `
                : html`
                    ${this._notificationsSnapshot.issues.length > 0
                      ? this._renderNotificationsSection("Repairs", this._notificationsSnapshot.issues)
                      : null}
                    ${this._notificationsSnapshot.notifications.length > 0
                      ? this._renderNotificationsSection("Persistent", this._notificationsSnapshot.notifications)
                      : null}
                  `}
        </div>
      </aside>

      <belovodya-card-editor-dialog
        .open=${Boolean(this._editorCard)}
        .hass=${this.hass}
        .lovelaceConfig=${this._dashboard?.raw}
        .cardConfig=${this._editorCard?.config}
        .cardLabel=${this._editorCard ? cardLabelFromConfig(this._editorCard.config) : ""}
        .saveHandler=${this._saveEditedCard}
        @belovodya-editor-close=${this._handleEditorClose}
      ></belovodya-card-editor-dialog>
    `;
  }

  private _renderNotificationsSection(title: string, items: readonly BelovodyaNotificationItem[]) {
    return html`
      <section class="notifications-section">
        <div class="notifications-section__head">
          <h3 class="notifications-section__title">${title}</h3>
          <span class="notifications-section__count">${items.length}</span>
        </div>
        <div class="notifications-list">
          ${repeat(
            items,
            (item) => item.id,
            (item) => html`
              <article class="notifications-item">
                <div class="notifications-item__head">
                  <h4 class="notifications-item__title">${item.title}</h4>
                  ${item.severity
                    ? html`<span class="notifications-item__severity" data-severity=${item.severity.toLowerCase()}>
                        ${item.severity}
                      </span>`
                    : null}
                </div>
                <p class="notifications-item__body">${item.body}</p>
                ${item.actionPath
                  ? html`
                      <div class="notifications-item__actions">
                        <a
                          class="notifications-item__link"
                          href=${item.actionPath}
                          @click=${(event: Event) => this._handleNotificationNavigate(event, item.actionPath!)}
                        >
                          Открыть
                        </a>
                      </div>
                    `
                  : null}
              </article>
            `,
          )}
        </div>
      </section>
    `;
  }

  private async _syncDashboard(): Promise<void> {
    if (!this.hass) {
      return;
    }

    const routeState = this._resolveRouteState();
    const shouldReloadDashboard = !this._dashboard || this._dashboard.dashboardPath !== routeState.dashboardPath;

    if (!shouldReloadDashboard) {
      const currentDashboard = this._dashboard;
      if (currentDashboard) {
        this._activeView = resolveViewForPath(currentDashboard, routeState.viewPath);
      }
      return;
    }

    const token = ++this._dashboardLoadToken;
    this._dashboardLoading = true;
    this._dashboardError = null;

    try {
      await ensureLovelaceResourcesLoaded(this.hass);
      const config = await fetchLovelaceConfig(this.hass, routeState.dashboardPath);
      if (token !== this._dashboardLoadToken) {
        return;
      }

      const dashboard = parseLovelaceDashboard(config, routeState.dashboardPath);
      this._dashboard = dashboard;
      this._activeView = resolveViewForPath(dashboard, routeState.viewPath);
      debugLog("dashboard loaded", {
        dashboardPath: routeState.dashboardPath,
        views: dashboard.views.map((view) => ({ key: view.key, title: view.title })),
      });
    } catch (error) {
      if (token !== this._dashboardLoadToken) {
        return;
      }

      this._dashboardError = error instanceof Error ? error.message : "Не удалось получить Lovelace config.";
      this._dashboard = undefined;
      this._activeView = undefined;
      debugLog("dashboard error", error);
    } finally {
      if (token === this._dashboardLoadToken) {
        this._dashboardLoading = false;
      }
    }
  }

  private _syncSidebarSnapshot(nextSnapshot: HASidebarSnapshot): void {
    debugLog("navigation source", {
      panels: this.hass ? Object.values(this.hass.panels).map((panel) => ({
        url_path: panel.url_path,
        title: panel.title,
        icon: panel.icon,
        show_in_sidebar: panel.show_in_sidebar,
        require_admin: panel.require_admin,
      })) : [],
      extracted: nextSnapshot,
    });

    if (sameSidebarSnapshot(this._sidebarSnapshot, nextSnapshot)) {
      return;
    }

    this._sidebarSnapshot = nextSnapshot;
  }

  private _refreshSidebarSnapshot = (): void => {
    if (!this.hass) {
      return;
    }

    this._syncSidebarSnapshot(extractSidebarSnapshot(this.hass));
  };

  private _resolveDefaultDashboardPath(): string | null {
    const configuredDashboard = this._panelConfig.default_dashboard;
    if (configuredDashboard) {
      return configuredDashboard;
    }

    if (!this.hass) {
      return null;
    }

    const panels = Object.values(this.hass.panels);
    const namedDashboard = panels.find((panel) =>
      panel.component_name === "lovelace"
      && panel.url_path !== "belovodya"
      && panel.url_path !== "lovelace"
    );

    if (namedDashboard) {
      return namedDashboard.url_path;
    }

    return panels.find((panel) => panel.component_name === "lovelace" && panel.url_path !== "belovodya")?.url_path ?? null;
  }

  private _resolveRouteState(): { dashboardPath: string | null; viewPath: string | null } {
    const routeState = parseBelovodyaRoute(this.route ?? { path: "", prefix: "" }, this._panelConfig);
    return {
      ...routeState,
      dashboardPath: routeState.dashboardPath ?? this._resolveDefaultDashboardPath(),
    };
  }

  private _clearSidebarBootstrapTimers(): void {
    for (const timerId of this._sidebarBootstrapTimers) {
      window.clearTimeout(timerId);
    }

    this._sidebarBootstrapTimers = [];
  }

  private _scheduleSidebarBootstrapRefresh(): void {
    this._clearSidebarBootstrapTimers();

    for (const delay of [0, 120, 360, 1000]) {
      const timerId = window.setTimeout(() => {
        this._refreshSidebarSnapshot();
      }, delay);
      this._sidebarBootstrapTimers.push(timerId);
    }
  }

  private _resolveActiveItem(activePath: string, navigation: readonly HANavigationItem[]): HANavigationItem | undefined {
    return navigation.find((item) => this._isActivePath(item.path, activePath));
  }

  private _prioritizeActiveNavigation(
    activePath: string,
    navigation: readonly HANavigationItem[],
  ): readonly HANavigationItem[] {
    const activeIndex = navigation.findIndex((item) => this._isActivePath(item.path, activePath));
    if (activeIndex <= 0) {
      return navigation;
    }

    const activeItem = navigation[activeIndex];
    if (!activeItem) {
      return navigation;
    }

    return [
      activeItem,
      ...navigation.slice(0, activeIndex),
      ...navigation.slice(activeIndex + 1),
    ];
  }

  private _isActivePath(path: string | null, activePath: string): boolean {
    if (!path) {
      return false;
    }

    return activePath === path || activePath.startsWith(`${path}/`);
  }

  private _handleNavigationClick(event: Event, item: HANavigationItem): void {
    event.preventDefault();
    this._notificationsOpen = false;
    debugLog("navigation click", { item });

    if (item.actionKind === "native-click") {
      if (!triggerNativeSidebarAction(item) && item.path) {
        navigateToPanelPath(item.path);
      }
      return;
    }

    if (item.path) {
      navigateToPanelPath(item.path);
    }
  }

  private _handleUtilityAction(item: HANavigationItem): void {
    debugLog("utility click", { item });

    if (item.nativeClass === "notifications") {
      void this._toggleNotificationsDrawer();
      return;
    }

    if (item.actionKind === "native-click" && triggerNativeSidebarAction(item)) {
      this._notificationsOpen = false;
      return;
    }

    if (item.path) {
      this._notificationsOpen = false;
      navigateToPanelPath(item.path);
    }
  }

  private _toggleSidebarCollapsed = (): void => {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  };

  private _toggleEditMode = (): void => {
    this._editMode = !this._editMode;
    if (!this._editMode) {
      this._editorCard = undefined;
    }
  };

  private _handleLayoutVariantChange = (event: Event): void => {
    const nextVariant = (event.currentTarget as HTMLSelectElement).value as BelovodyaLayoutVariant;
    this._layoutVariant = nextVariant;
  };

  private _handleWindowKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this._notificationsOpen) {
      this._notificationsOpen = false;
      return;
    }

    if (event.key === "Escape" && this._editorCard) {
      this._editorCard = undefined;
    }
  };

  private _closeNotificationsDrawer = (): void => {
    this._notificationsOpen = false;
  };

  private _refreshNotificationsClick = (): void => {
    void this._loadNotifications(true);
  };

  private async _toggleNotificationsDrawer(): Promise<void> {
    if (this._notificationsOpen) {
      this._notificationsOpen = false;
      return;
    }

    this._notificationsOpen = true;
    await this._loadNotifications(false);
  }

  private async _loadNotifications(forceRefresh: boolean): Promise<void> {
    if (!this.hass || this._notificationsLoading) {
      return;
    }

    const snapshotAge = Date.now() - this._notificationsSnapshot.fetchedAt;
    if (!forceRefresh && this._notificationsSnapshot.fetchedAt > 0 && snapshotAge < NOTIFICATIONS_REFRESH_TTL) {
      return;
    }

    this._notificationsLoading = true;
    this._notificationsError = null;

    try {
      this._notificationsSnapshot = await fetchBelovodyaNotifications(this.hass);
      debugLog("notifications snapshot", this._notificationsSnapshot);
    } catch (error) {
      this._notificationsError = "Не удалось получить уведомления Home Assistant.";
      debugLog("notifications error", error);
    } finally {
      this._notificationsLoading = false;
    }
  }

  private _handleNotificationNavigate(event: Event, path: string): void {
    event.preventDefault();
    this._notificationsOpen = false;
    navigateToPanelPath(path);
  }

  private _handleOpenOriginalDashboard = (): void => {
    const routeState = this._resolveRouteState();
    const path = buildOriginalLovelaceUrl(routeState.dashboardPath, this._activeView?.key ?? routeState.viewPath);
    this._notificationsOpen = false;
    navigateToPanelPath(path);
  };

  private _handleEditCardRequest = (event: Event): void => {
    if (!this._editMode) {
      return;
    }

    const customEvent = event as CustomEvent<{ node: LayoutCardNode }>;
    this._editorCard = customEvent.detail.node;
    this._notificationsOpen = false;
    debugLog("edit card request", {
      path: customEvent.detail.node.path,
      type: customEvent.detail.node.config.type,
    });
  };

  private _handleEditorClose = (): void => {
    this._editorCard = undefined;
  };

  private _saveEditedCard = async (nextCardConfig: LovelaceCardConfig): Promise<void> => {
    if (!this.hass || !this._dashboard || !this._activeView || !this._editorCard) {
      throw new Error("Belovodya UI lost the current editor context.");
    }

    const nextRaw = updateCardConfigAtPath(
      this._dashboard.raw,
      this._activeView.index,
      this._editorCard.path,
      nextCardConfig,
    );

    await this.hass.callWS<void>({
      type: "lovelace/config/save",
      url_path: this._dashboard.dashboardPath,
      config: nextRaw,
    });

    const nextDashboard = parseLovelaceDashboard(nextRaw, this._dashboard.dashboardPath);
    const routeState = parseBelovodyaRoute(this.route ?? { path: "", prefix: "" }, this._panelConfig);
    this._dashboard = nextDashboard;
    this._activeView = resolveViewForPath(nextDashboard, routeState.viewPath);
    this._editorCard = undefined;
    debugLog("card saved", {
      dashboardPath: this._dashboard.dashboardPath,
      view: this._activeView?.key,
      cardType: nextCardConfig.type,
    });
  };

  private get _panelConfig(): BelovodyaPanelRuntimeConfig {
    return this.panel?.config ?? DEFAULT_PANEL_CONFIG;
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

  private _renderHomeIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 9.25L10 4.5L15.75 9.25V15.25C15.75 15.66 15.41 16 15 16H11.75V11.75H8.25V16H5C4.59 16 4.25 15.66 4.25 15.25V9.25Z"></path>
      </svg>
    `;
  }

  private _renderBellIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 16.25C10.83 16.25 11.5 15.58 11.5 14.75H8.5C8.5 15.58 9.17 16.25 10 16.25Z"></path>
        <path d="M14.25 13.5H5.75L6.56 12.15C6.88 11.61 7.05 11 7.05 10.37V8.75C7.05 7.12 8.37 5.8 10 5.8C11.63 5.8 12.95 7.12 12.95 8.75V10.37C12.95 11 13.12 11.61 13.44 12.15L14.25 13.5Z"></path>
        <path d="M8.25 4.9C8.25 3.93 9.03 3.15 10 3.15C10.97 3.15 11.75 3.93 11.75 4.9"></path>
      </svg>
    `;
  }

  private _renderEditIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.25 13.95V15.75H6.05L14.44 7.36L12.64 5.56L4.25 13.95Z"></path>
        <path d="M15.23 6.57L13.43 4.77L14.33 3.87C14.73 3.48 15.36 3.48 15.76 3.87L16.13 4.24C16.52 4.64 16.52 5.27 16.13 5.67L15.23 6.57Z"></path>
      </svg>
    `;
  }

  private _renderLayoutIcon() {
    return html`
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 4.5H16.5V7.5H3.5V4.5Z"></path>
        <path d="M3.5 9.25H9.5V15.5H3.5V9.25Z"></path>
        <path d="M10.75 9.25H16.5V12H10.75V9.25Z"></path>
        <path d="M10.75 13.25H16.5V15.5H10.75V13.25Z"></path>
      </svg>
    `;
  }
}

if (!customElements.get("belovodya-app")) {
  customElements.define("belovodya-app", BelovodyaApp);
}
