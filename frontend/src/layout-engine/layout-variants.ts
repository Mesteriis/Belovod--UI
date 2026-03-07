import type { BelovodyaLayoutVariant, BelovodyaLayoutVariantOption } from "../types";
import type {
  LayoutCardNode,
  LayoutFloatingNode,
  LayoutGridNode,
  LayoutNode,
  LayoutOverlayNode,
  LayoutStackNode,
} from "./layout-node";

export const LAYOUT_VARIANT_OPTIONS: readonly BelovodyaLayoutVariantOption[] = Object.freeze([
  {
    value: "native",
    label: "Native",
    description: "Повторяет исходную структуру Lovelace.",
  },
  {
    value: "dense",
    label: "Dense",
    description: "Уплотняет сетку и уменьшает вертикальные зазоры.",
  },
  {
    value: "focus",
    label: "Focus",
    description: "Делает крупнее карточки и снижает число колонок.",
  },
  {
    value: "stack",
    label: "Stack",
    description: "Собирает главный контент в один вертикальный поток.",
  },
]);

const cloneCard = (node: LayoutCardNode, variant: BelovodyaLayoutVariant): LayoutCardNode => {
  if (variant === "dense") {
    return {
      ...node,
      columnSpan: Math.max(1, Math.min(node.columnSpan, 2)),
      minHeight: node.minHeight ?? "180px",
    };
  }

  if (variant === "focus") {
    return {
      ...node,
      columnSpan: Math.max(2, node.columnSpan),
      minHeight: node.minHeight ?? "280px",
    };
  }

  if (variant === "stack") {
    return {
      ...node,
      columnSpan: 1,
      rowSpan: 1,
      minHeight: node.minHeight ?? "240px",
    };
  }

  return { ...node };
};

const flattenToStackChildren = (node: LayoutNode): readonly LayoutNode[] => {
  switch (node.kind) {
    case "grid":
    case "stack":
    case "overlay":
      return node.children.flatMap((child) => flattenToStackChildren(child));
    case "floating":
      return flattenToStackChildren(node.child);
    case "card":
      return [cloneCard(node, "stack")];
    default:
      return [];
  }
};

const cloneGrid = (node: LayoutGridNode, variant: BelovodyaLayoutVariant): LayoutGridNode => {
  const transformedChildren = node.children.map((child) => transformLayoutVariant(child, variant));

  if (variant === "dense") {
    return {
      ...node,
      columns: Math.max(node.columns, 4),
      gap: "12px",
      children: transformedChildren,
    };
  }

  if (variant === "focus") {
    return {
      ...node,
      columns: Math.min(node.columns, 2),
      gap: "18px",
      children: transformedChildren,
    };
  }

  if (variant === "stack") {
    return {
      ...node,
      columns: 1,
      gap: "14px",
      children: transformedChildren,
    };
  }

  return {
    ...node,
    children: transformedChildren,
  };
};

const cloneStack = (node: LayoutStackNode, variant: BelovodyaLayoutVariant): LayoutStackNode => ({
  ...node,
  direction: variant === "stack" ? "vertical" : node.direction,
  gap: variant === "dense" ? "12px" : node.gap,
  children: node.children.map((child) => transformLayoutVariant(child, variant)),
});

const cloneOverlay = (node: LayoutOverlayNode, variant: BelovodyaLayoutVariant): LayoutOverlayNode => ({
  ...node,
  children: node.children.map((child) => transformLayoutVariant(child, variant)),
});

const cloneFloating = (node: LayoutFloatingNode, variant: BelovodyaLayoutVariant): LayoutFloatingNode => ({
  ...node,
  child: transformLayoutVariant(node.child, variant),
});

export const transformLayoutVariant = (
  node: LayoutNode,
  variant: BelovodyaLayoutVariant,
): LayoutNode => {
  if (variant === "stack") {
    return {
      id: `${node.id}-stacked`,
      kind: "stack",
      direction: "vertical",
      gap: "14px",
      children: flattenToStackChildren(node),
    } satisfies LayoutStackNode;
  }

  switch (node.kind) {
    case "grid":
      return cloneGrid(node, variant);
    case "stack":
      return cloneStack(node, variant);
    case "overlay":
      return cloneOverlay(node, variant);
    case "floating":
      return cloneFloating(node, variant);
    case "card":
      return cloneCard(node, variant);
    default:
      return node;
  }
};
