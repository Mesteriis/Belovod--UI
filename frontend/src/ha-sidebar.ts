import { extractNavigationItems, sameNavigationItems } from "./lovelace-parser";
import type { HANavigationItem, HomeAssistant } from "./types";

const HOME_ASSISTANT_SELECTOR = "home-assistant";
const MAIN_SELECTOR = "home-assistant-main";
const SIDEBAR_SELECTOR = "ha-sidebar";
const UTILITY_ICON_MAP: Readonly<Record<string, string>> = Object.freeze({
  configuration: "mdi:cog",
  notifications: "mdi:bell-badge-outline",
  user: "mdi:account-circle-outline",
});
const PATH_ICON_MAP: Readonly<Record<string, string>> = Object.freeze({
  "/config": "mdi:cog",
  "/profile": "mdi:account-circle-outline",
});
const UTILITY_NATIVE_CLASSES = new Set(["configuration", "notifications", "user"]);

export interface HASidebarSnapshot {
  main: readonly HANavigationItem[];
  utility: readonly HANavigationItem[];
}

const FALLBACK_UTILITY_ITEMS: readonly HANavigationItem[] = Object.freeze([
  {
    id: "utility-configuration",
    path: "/config",
    title: "Настройки",
    icon: "mdi:cog",
    section: "utility",
    actionKind: "path",
    nativeClass: "configuration",
  },
  {
    id: "utility-notifications",
    path: null,
    title: "Уведомления",
    icon: "mdi:bell-badge-outline",
    section: "utility",
    actionKind: "native-click",
    nativeClass: "notifications",
  },
  {
    id: "utility-user",
    path: "/profile",
    title: "Профиль",
    icon: "mdi:account-circle-outline",
    section: "utility",
    actionKind: "path",
    nativeClass: "user",
  },
]);

const normalizeTitle = (value: string | null | undefined, fallback: string): string => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const normalizePath = (value: string | null | undefined): string | null => {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(normalized, window.location.origin);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
};

const iconFromElement = (element: Element | null, path: string | null, nativeClass: string | null): string => {
  const iconElement = element?.querySelector("ha-icon, ha-svg-icon") as HTMLElement & { icon?: string } | null;
  if (iconElement?.icon) {
    return iconElement.icon;
  }

  if (nativeClass && nativeClass in UTILITY_ICON_MAP) {
    return UTILITY_ICON_MAP[nativeClass];
  }

  if (path && path in PATH_ICON_MAP) {
    return PATH_ICON_MAP[path];
  }

  return "mdi:view-dashboard-outline";
};

const homeAssistantRoot = (): ShadowRoot | null =>
  document.querySelector(HOME_ASSISTANT_SELECTOR)?.shadowRoot ?? null;

const nativeSidebarElement = (): HTMLElement | null => {
  const main = homeAssistantRoot()?.querySelector(MAIN_SELECTOR) as HTMLElement | null;
  const mainRoot = main?.shadowRoot ?? null;
  return (mainRoot?.querySelector(SIDEBAR_SELECTOR) as HTMLElement | null) ?? null;
};

const nativeLists = (): readonly HTMLElement[] => {
  const sidebar = nativeSidebarElement();
  const lists = sidebar?.shadowRoot?.querySelectorAll("ha-md-list") ?? [];
  return Array.from(lists) as HTMLElement[];
};

const assignedSidebarItems = (list: HTMLElement | undefined): readonly HTMLElement[] => {
  const slot = list?.shadowRoot?.querySelector("slot");
  if (!(slot instanceof HTMLSlotElement)) {
    return Object.freeze([]);
  }

  return slot.assignedElements({ flatten: true }).filter((element): element is HTMLElement => element instanceof HTMLElement);
};

const elementHref = (element: HTMLElement): string | null => {
  const candidate = (element as HTMLElement & { href?: string }).href ?? element.getAttribute("href");
  if (candidate) {
    return candidate;
  }

  const anchor = element.shadowRoot?.querySelector("a[href]") as HTMLAnchorElement | null;
  return anchor?.href ?? null;
};

const elementNativeClass = (element: HTMLElement): string | null => {
  const classes = Array.from(element.classList).map((item) => item.trim()).filter(Boolean);
  return classes[0] ?? null;
};

const itemFromNativeElement = (
  element: HTMLElement,
  section: HANavigationItem["section"],
  index: number,
): HANavigationItem | undefined => {
  const title = normalizeTitle(element.textContent, `item-${index + 1}`);
  const path = normalizePath(elementHref(element));
  const nativeClass = elementNativeClass(element);

  return {
    id: `${section}-${path ?? nativeClass ?? title}-${index}`,
    path,
    title,
    icon: iconFromElement(element, path, nativeClass),
    section,
    actionKind: path ? "path" : "native-click",
    nativeClass,
  };
};

const isUtilityElement = (element: HTMLElement): boolean => {
  const nativeClass = elementNativeClass(element);
  return nativeClass ? UTILITY_NATIVE_CLASSES.has(nativeClass) : false;
};

const resolveNativeItemGroups = (): {
  mainElements: readonly HTMLElement[];
  utilityElements: readonly HTMLElement[];
} => {
  const listItems = nativeLists().map((list) => assignedSidebarItems(list));
  const utilityElements = listItems.find((items) => items.some((element) => isUtilityElement(element))) ?? Object.freeze([]);
  const mainElements = listItems.find((items) =>
    items !== utilityElements && items.some((element) => !isUtilityElement(element))
  ) ?? Object.freeze([]);

  return { mainElements, utilityElements };
};

const fallbackMainNavigation = (hass: HomeAssistant): readonly HANavigationItem[] =>
  extractNavigationItems(hass)
    .filter((item) => item.path !== "/config" && item.path !== "/profile")
    .map((item, index) => ({
      ...item,
      id: `main-${item.path}-${index}`,
      section: "main",
      actionKind: "path",
      nativeClass: null,
    }));

export const extractSidebarSnapshot = (hass: HomeAssistant): HASidebarSnapshot => {
  const { mainElements, utilityElements } = resolveNativeItemGroups();
  const main = mainElements
    .map((element, index) => itemFromNativeElement(element, "main", index))
    .filter((item): item is HANavigationItem => item !== undefined);
  const utility = utilityElements
    .map((element, index) => itemFromNativeElement(element, "utility", index))
    .filter((item): item is HANavigationItem => item !== undefined);

  return {
    main: main.length > 0 ? main : fallbackMainNavigation(hass),
    utility: utility.length > 0 ? utility : FALLBACK_UTILITY_ITEMS,
  };
};

export const sameSidebarSnapshot = (
  current: HASidebarSnapshot,
  next: HASidebarSnapshot,
): boolean => sameNavigationItems(current.main, next.main) && sameNavigationItems(current.utility, next.utility);

export const triggerNativeSidebarAction = (item: HANavigationItem): boolean => {
  const { utilityElements } = resolveNativeItemGroups();
  const candidates = utilityElements;
  const target = candidates.find((element) => {
    const href = normalizePath(elementHref(element));
    const nativeClass = elementNativeClass(element);
    const title = normalizeTitle(element.textContent, "");
    return (
      (item.nativeClass && nativeClass === item.nativeClass) ||
      (item.path && href === item.path) ||
      title === item.title
    );
  });

  if (!target) {
    return false;
  }

  target.click();
  return true;
};
