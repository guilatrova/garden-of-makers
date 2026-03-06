/**
 * Forest Layout Engine Types
 */

import { TreeData } from "@/lib/services/tree/types";

export interface TreePosition {
  x: number;
  y: number;
  z: number;
}

export interface PositionedTree extends TreeData {
  position: TreePosition;
}

export interface ForestLayoutConfig {
  /** Minimum spacing multiplier between trees (relative to canopy radius) */
  spacingMultiplier: number;
  /** Maximum zone radius for tree distribution */
  zoneRadius: number;
  /** Whether to place ancient/world trees at center */
  centerSpecialTrees: boolean;
}

export const DEFAULT_LAYOUT_CONFIG: ForestLayoutConfig = {
  spacingMultiplier: 2.5,
  zoneRadius: 80,
  centerSpecialTrees: true,
};
