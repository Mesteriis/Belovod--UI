import type {
  BelovodyaPanelRuntimeConfig,
  NavigateOptions,
  Route,
} from "./types";

export interface BelovodyaRouteState {
  dashboardPath: string | null;
  viewPath: string | null;
}

const normalizeSegments = (path: string): string[] =>
  path
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

export const parseBelovodyaRoute = (
  route: Route,
  panelConfig: BelovodyaPanelRuntimeConfig,
): BelovodyaRouteState => {
  const segments = normalizeSegments(route.path || "");
  const defaultDashboard = panelConfig.default_dashboard;

  if (segments[0] === "dashboard") {
    return {
      dashboardPath: segments[1] ?? defaultDashboard,
      viewPath:
        segments[2] === "view"
          ? segments.slice(3).join("/") || null
          : segments.slice(2).join("/") || null,
    };
  }

  if (segments[0] === "view") {
    return {
      dashboardPath: defaultDashboard,
      viewPath: segments.slice(1).join("/") || null,
    };
  }

  return {
    dashboardPath: defaultDashboard,
    viewPath: segments.join("/") || null,
  };
};

export const buildBelovodyaUrl = (
  panelUrlPath: string,
  viewPath: string | null,
  dashboardPath: string | null,
): string => {
  const encodedViewPath = viewPath
    ? viewPath
        .split("/")
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join("/")
    : "";

  if (dashboardPath) {
    return encodedViewPath
      ? `/${panelUrlPath}/dashboard/${encodeURIComponent(dashboardPath)}/view/${encodedViewPath}`
      : `/${panelUrlPath}/dashboard/${encodeURIComponent(dashboardPath)}`;
  }

  return encodedViewPath ? `/${panelUrlPath}/view/${encodedViewPath}` : `/${panelUrlPath}`;
};

export const buildOriginalLovelaceUrl = (
  dashboardPath: string | null,
  viewPath: string | null,
): string => {
  if (dashboardPath) {
    return viewPath ? `/${dashboardPath}/${viewPath}` : `/${dashboardPath}`;
  }

  return viewPath ? `/lovelace/${viewPath}` : "/lovelace";
};

export const navigatePath = (path: string, options: NavigateOptions = {}): void => {
  const replace = options.replace ?? false;

  if (replace) {
    window.history.replaceState(window.history.state, "", path);
  } else {
    window.history.pushState(window.history.state, "", path);
  }

  const event = new Event("location-changed", {
    bubbles: true,
    cancelable: false,
    composed: true,
  }) as Event & { detail?: NavigateOptions };
  event.detail = { replace };
  window.dispatchEvent(event);
};
