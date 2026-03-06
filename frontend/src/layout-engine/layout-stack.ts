import type {
  LayoutFloatingNode,
  LayoutNode,
  LayoutOverlayNode,
  LayoutStackNode,
} from "./layout-node";

const DEFAULT_GAP = "var(--belovodya-gap)";

export const createStackNode = (
  id: string,
  children: readonly LayoutNode[],
  direction: "horizontal" | "vertical" = "vertical",
): LayoutStackNode => ({
  id,
  kind: "stack",
  direction,
  gap: DEFAULT_GAP,
  children,
});

export const createOverlayNode = (
  id: string,
  children: readonly LayoutNode[],
): LayoutOverlayNode => ({
  id,
  kind: "overlay",
  children,
});

export const createFloatingNode = (
  id: string,
  child: LayoutNode,
  position: LayoutFloatingNode["position"],
): LayoutFloatingNode => ({
  id,
  kind: "floating",
  child,
  position,
});
