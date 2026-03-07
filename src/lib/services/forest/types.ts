/**
 * Forest Service Types
 */

import { TreeData } from "@/lib/services/tree/types";

// === Forest Data Types ===

export interface ForestData {
  trees: TreeData[];
  totalStartups: number;
  categories: string[];
  lastSyncedAt: string;
}

export interface ForestServiceOptions {
  category?: string;
}

// === Forest Layout Engine Types ===

export interface TreePosition {
  x: number;
  y: number;
  z: number;
}

export interface PositionedTree extends TreeData {
  position: TreePosition;
}

export interface ForestLayoutConfig {
  /** Fixed lot size for each tree footprint */
  lotSize: number;
}

export const DEFAULT_LAYOUT_CONFIG: ForestLayoutConfig = {
  lotSize: 10,
};
