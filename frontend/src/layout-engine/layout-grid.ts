import type { LovelaceCardConfig } from "../types";
import type {
  BelovodyaLayoutHint,
  LayoutCardNode,
  LayoutGridNode,
  LayoutNode,
  LayoutPath,
} from "./layout-node";
import { createFloatingNode, createOverlayNode } from "./layout-stack";

const DEFAULT_GAP = "var(--belovodya-gap)";

const numberOr = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

export const readLayoutHint = (config: Record<string, unknown>): BelovodyaLayoutHint => {
  const rawHint = config.view_layout;
  if (rawHint && typeof rawHint === "object" && !Array.isArray(rawHint)) {
    return rawHint as BelovodyaLayoutHint;
  }

  return {};
};

export const createGridNode = (
  id: string,
  children: readonly LayoutNode[],
  columns = 12,
): LayoutGridNode => ({
  id,
  kind: "grid",
  columns,
  gap: DEFAULT_GAP,
  children,
});

const wrapCardNode = (
  id: string,
  config: LovelaceCardConfig,
  node: LayoutCardNode,
): LayoutNode => {
  const hint = readLayoutHint(config);

  if (hint.layout === "overlay") {
    return createOverlayNode(`${id}-overlay`, [node]);
  }

  if (hint.layout === "floating") {
    return createFloatingNode(`${id}-floating`, node, {
      top: hint.top,
      right: hint.right,
      bottom: hint.bottom,
      left: hint.left,
    });
  }

  return node;
};

export const createCardNodeFromConfig = (
  id: string,
  config: LovelaceCardConfig,
  path: LayoutPath,
): LayoutNode => {
  const hint = readLayoutHint(config);

  const node: LayoutCardNode = {
    id,
    kind: "card",
    config,
    path,
    columnSpan: Math.max(1, numberOr(hint.columnspan, 3)),
    rowSpan: Math.max(1, numberOr(hint.rowspan, 1)),
    minHeight: typeof hint.min_height === "string" ? hint.min_height : undefined,
  };

  return wrapCardNode(id, config, node);
};
