import { createCardNodeFromConfig, createGridNode, readLayoutHint } from "./layout-engine/layout-grid";
import type { LayoutNode } from "./layout-engine/layout-node";
import { createOverlayNode, createStackNode } from "./layout-engine/layout-stack";
import type {
  HANavigationItem,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceConfig,
  LovelaceRawConfig,
  LovelaceSectionConfig,
  LovelaceViewConfig,
  PanelInfo,
} from "./types";

const LOVELACE_CONFIG_COMMAND = "lovelace/config";

export interface BelovodyaParsedView {
  key: string;
  title: string;
  layout: LayoutNode;
  raw: LovelaceViewConfig;
}

export interface BelovodyaParsedDashboard {
  dashboardPath: string | null;
  raw: LovelaceConfig;
  views: readonly BelovodyaParsedView[];
}

const isLovelaceConfig = (config: LovelaceRawConfig): config is LovelaceConfig =>
  "views" in config && Array.isArray(config.views);

const normalizeViewKey = (view: LovelaceViewConfig, index: number): string =>
  view.path?.trim() || `view-${index + 1}`;

const normalizeViewTitle = (view: LovelaceViewConfig, index: number): string =>
  view.title?.trim() || `View ${index + 1}`;

const parseCard = (card: LovelaceCardConfig, id: string): LayoutNode => {
  const hint = readLayoutHint(card);

  if (card.type === "grid" && Array.isArray(card.cards)) {
    const children = parseCards(card.cards as LovelaceCardConfig[], `${id}-grid`);
    return createGridNode(id, children, typeof hint.columns === "number" ? hint.columns : 2);
  }

  if (card.type === "horizontal-stack" && Array.isArray(card.cards)) {
    return createStackNode(
      id,
      parseCards(card.cards as LovelaceCardConfig[], `${id}-horizontal-stack`),
      "horizontal",
    );
  }

  if (card.type === "vertical-stack" && Array.isArray(card.cards)) {
    return createStackNode(
      id,
      parseCards(card.cards as LovelaceCardConfig[], `${id}-vertical-stack`),
      "vertical",
    );
  }

  if (hint.layout === "stack" && Array.isArray(card.cards)) {
    return createStackNode(
      id,
      parseCards(card.cards as LovelaceCardConfig[], `${id}-stack`),
      hint.direction ?? "vertical",
    );
  }

  if (hint.layout === "overlay" && Array.isArray(card.cards)) {
    return createOverlayNode(id, parseCards(card.cards as LovelaceCardConfig[], `${id}-overlay`));
  }

  return createCardNodeFromConfig(id, card);
};

const parseCards = (cards: readonly LovelaceCardConfig[], prefix: string): readonly LayoutNode[] =>
  cards.map((card, index) => parseCard(card, `${prefix}-card-${index}`));

const parseSections = (
  sections: readonly LovelaceSectionConfig[],
  prefix: string,
): LayoutNode => {
  const children = sections.map((section, index) =>
    createStackNode(
      `${prefix}-section-${index}`,
      parseCards(section.cards ?? [], `${prefix}-section-${index}`),
      "vertical",
    ),
  );

  return createGridNode(`${prefix}-sections`, children, Math.min(3, Math.max(children.length, 1)));
};

const parseView = (view: LovelaceViewConfig, index: number): BelovodyaParsedView => {
  const key = normalizeViewKey(view, index);
  const title = normalizeViewTitle(view, index);

  const layout = Array.isArray(view.sections) && view.sections.length > 0
    ? parseSections(view.sections, `view-${key}`)
    : createGridNode(`view-${key}`, parseCards(view.cards ?? [], `view-${key}`));

  return {
    key,
    title,
    layout,
    raw: view,
  };
};

export const fetchLovelaceConfig = async (
  hass: HomeAssistant,
  dashboardPath: string | null,
): Promise<LovelaceConfig> => {
  const config = await hass.callWS<LovelaceRawConfig>({
    type: LOVELACE_CONFIG_COMMAND,
    url_path: dashboardPath,
    force: false,
  });

  if (!isLovelaceConfig(config)) {
    throw new Error("Belovodya UI requires a Lovelace dashboard config with resolved views");
  }

  return config;
};

export const parseLovelaceDashboard = (
  config: LovelaceConfig,
  dashboardPath: string | null,
): BelovodyaParsedDashboard => ({
  dashboardPath,
  raw: config,
  views: config.views.map((view, index) => parseView(view, index)),
});

export const resolveViewForPath = (
  dashboard: BelovodyaParsedDashboard,
  viewPath: string | null,
): BelovodyaParsedView | undefined => {
  if (!viewPath) {
    return dashboard.views[0];
  }

  return dashboard.views.find((view) => view.key === viewPath) ?? dashboard.views[0];
};

export const buildBreadcrumbs = (
  dashboard: BelovodyaParsedDashboard,
  view: BelovodyaParsedView | undefined,
): readonly string[] => {
  const breadcrumbs = ["Belovodya"];

  if (dashboard.dashboardPath) {
    breadcrumbs.push(dashboard.dashboardPath);
  }

  if (view) {
    breadcrumbs.push(view.title);
  }

  return breadcrumbs;
};

const toNavigationItem = (panel: PanelInfo): HANavigationItem | undefined => {
  if (panel.show_in_sidebar === false || panel.url_path === "notfound") {
    return undefined;
  }

  return {
    path: `/${panel.url_path}`,
    title: panel.title || panel.url_path,
    icon: panel.icon || "mdi:view-dashboard-outline",
  };
};

export const extractNavigationItems = (hass: HomeAssistant): readonly HANavigationItem[] =>
  Object.values(hass.panels)
    .filter((panel) => !panel.require_admin || hass.user?.is_admin)
    .map(toNavigationItem)
    .filter((panel): panel is HANavigationItem => panel !== undefined);
