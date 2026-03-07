import type { LovelaceCardConfig } from "../types";

export type LayoutPathSegment = string | number;
export type LayoutPath = readonly LayoutPathSegment[];

export type LayoutNode =
  | LayoutGridNode
  | LayoutStackNode
  | LayoutOverlayNode
  | LayoutFloatingNode
  | LayoutCardNode;

export interface BelovodyaLayoutHint {
  layout?: "grid" | "stack" | "overlay" | "floating";
  direction?: "horizontal" | "vertical";
  columnspan?: number;
  rowspan?: number;
  min_height?: string;
  columns?: number;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

interface LayoutBaseNode {
  id: string;
  kind: string;
}

export interface LayoutGridNode extends LayoutBaseNode {
  kind: "grid";
  columns: number;
  gap: string;
  children: readonly LayoutNode[];
}

export interface LayoutStackNode extends LayoutBaseNode {
  kind: "stack";
  direction: "horizontal" | "vertical";
  gap: string;
  children: readonly LayoutNode[];
}

export interface LayoutOverlayNode extends LayoutBaseNode {
  kind: "overlay";
  children: readonly LayoutNode[];
}

export interface LayoutFloatingNode extends LayoutBaseNode {
  kind: "floating";
  child: LayoutNode;
  position: Partial<Record<"top" | "right" | "bottom" | "left", string>>;
}

export interface LayoutCardNode extends LayoutBaseNode {
  kind: "card";
  config: LovelaceCardConfig;
  path: LayoutPath;
  columnSpan: number;
  rowSpan: number;
  minHeight?: string;
}
