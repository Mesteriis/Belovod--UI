import type { CardHelpers, HomeAssistant, LovelaceResource } from "./types";

const RESOURCE_COMMAND = "lovelace/resources";
const loadedResources = new Map<string, Promise<void>>();
let resourcesPromise: Promise<void> | undefined;
let helpersPromise: Promise<CardHelpers> | undefined;

const normalizeResourceUrl = (url: string): string => new URL(url, window.location.origin).toString();

const loadLinkResource = (url: string): Promise<void> => new Promise((resolve, reject) => {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[href="${url}"]`);
  if (existing) {
    resolve();
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.addEventListener("load", () => resolve(), { once: true });
  link.addEventListener("error", () => reject(new Error(`Failed to load resource: ${url}`)), { once: true });
  document.head.append(link);
});

const loadScriptResource = (url: string, type: "js" | "module"): Promise<void> => new Promise((resolve, reject) => {
  const selector = `script[src="${url}"]`;
  const existing = document.head.querySelector<HTMLScriptElement>(selector);
  if (existing) {
    resolve();
    return;
  }

  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  if (type === "module") {
    script.type = "module";
  }
  script.addEventListener("load", () => resolve(), { once: true });
  script.addEventListener("error", () => reject(new Error(`Failed to load resource: ${url}`)), { once: true });
  document.head.append(script);
});

const loadResource = (resource: LovelaceResource): Promise<void> => {
  const url = normalizeResourceUrl(resource.url);
  const cached = loadedResources.get(url);
  if (cached) {
    return cached;
  }

  const promise = (() => {
    switch (resource.type) {
      case "css":
        return loadLinkResource(url);
      case "js":
      case "module":
        return loadScriptResource(url, resource.type);
      default:
        return Promise.resolve();
    }
  })();

  loadedResources.set(url, promise);
  return promise;
};

export const ensureLovelaceResourcesLoaded = async (hass: HomeAssistant): Promise<void> => {
  if (!resourcesPromise) {
    resourcesPromise = hass
      .callWS<readonly LovelaceResource[]>({ type: RESOURCE_COMMAND })
      .then((resources) => Promise.all(resources.map((resource) => loadResource(resource))).then(() => undefined));
  }

  await resourcesPromise;
};

const waitForCardHelpers = async (): Promise<CardHelpers> => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (typeof window.loadCardHelpers === "function") {
      return window.loadCardHelpers();
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  throw new Error(
    "Lovelace runtime is unavailable. Open any native dashboard once to warm Home Assistant card helpers.",
  );
};

export const ensureCardHelpers = async (hass?: HomeAssistant): Promise<CardHelpers> => {
  if (hass) {
    await ensureLovelaceResourcesLoaded(hass);
  }

  if (!helpersPromise) {
    helpersPromise = waitForCardHelpers().catch((error) => {
      helpersPromise = undefined;
      throw error;
    });
  }

  return helpersPromise;
};
