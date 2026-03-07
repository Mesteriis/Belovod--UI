interface NativeShellElements {
  panelResolver: HTMLElement;
  panelShell: HTMLElement;
  sidebar: HTMLElement;
}

interface NativeShellStyleSnapshot {
  panelResolverStyle: string | null;
  panelShellStyle: string | null;
  sidebarStyle: string | null;
}

let activeSnapshot: NativeShellStyleSnapshot | null = null;

const resolveNativeShellElements = (): NativeShellElements | null => {
  const mainRoot = document
    .querySelector("home-assistant")
    ?.shadowRoot?.querySelector("home-assistant-main")
    ?.shadowRoot;

  const sidebar = mainRoot?.querySelector("ha-sidebar");
  const panelResolver = mainRoot?.querySelector("partial-panel-resolver");
  const panelShell = panelResolver?.querySelector("ha-panel-custom");

  if (!(sidebar instanceof HTMLElement) || !(panelResolver instanceof HTMLElement) || !(panelShell instanceof HTMLElement)) {
    return null;
  }

  return {
    panelResolver,
    panelShell,
    sidebar,
  };
};

const restoreStyleAttribute = (element: HTMLElement, value: string | null): void => {
  if (value === null || value === "") {
    element.removeAttribute("style");
    return;
  }

  element.setAttribute("style", value);
};

export const suppressNativeShell = (): boolean => {
  const elements = resolveNativeShellElements();
  if (!elements) {
    return false;
  }

  if (!activeSnapshot) {
    activeSnapshot = {
      panelResolverStyle: elements.panelResolver.getAttribute("style"),
      panelShellStyle: elements.panelShell.getAttribute("style"),
      sidebarStyle: elements.sidebar.getAttribute("style"),
    };
  }

  elements.sidebar.style.display = "none";

  elements.panelResolver.style.position = "fixed";
  elements.panelResolver.style.inset = "0";
  elements.panelResolver.style.transform = "none";
  elements.panelResolver.style.width = "100vw";
  elements.panelResolver.style.height = "100dvh";
  elements.panelResolver.style.maxWidth = "100vw";
  elements.panelResolver.style.display = "block";
  elements.panelResolver.style.zIndex = "10";

  elements.panelShell.style.position = "fixed";
  elements.panelShell.style.inset = "0";
  elements.panelShell.style.width = "100vw";
  elements.panelShell.style.height = "100dvh";
  elements.panelShell.style.display = "block";

  return true;
};

export const restoreNativeShell = (): void => {
  const elements = resolveNativeShellElements();
  if (!elements || !activeSnapshot) {
    activeSnapshot = null;
    return;
  }

  restoreStyleAttribute(elements.sidebar, activeSnapshot.sidebarStyle);
  restoreStyleAttribute(elements.panelResolver, activeSnapshot.panelResolverStyle);
  restoreStyleAttribute(elements.panelShell, activeSnapshot.panelShellStyle);
  activeSnapshot = null;
};
