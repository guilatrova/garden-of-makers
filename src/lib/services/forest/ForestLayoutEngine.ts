/**
 * Forest Layout Engine
 * Positions trees in 3D space using fixed lot size fibonacci spiral
 */

import { TreeData } from "@/lib/services/tree/types";
import {
  TreePosition,
  PositionedTree,
  ForestLayoutConfig,
  DEFAULT_LAYOUT_CONFIG,
} from "./types";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Calculate position using fibonacci spiral with fixed lot size
 */
export function fibonacciSpiral(
  index: number,
  lotSize: number
): { x: number; z: number } {
  if (index === 0) return { x: 0, z: 0 };

  const r = lotSize * Math.sqrt(index);
  const theta = index * GOLDEN_ANGLE;

  return {
    x: r * Math.cos(theta),
    z: r * Math.sin(theta),
  };
}

/**
 * Calculate distance between two positions
 */
export function getDistance(
  pos1: TreePosition,
  pos2: TreePosition
): number {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Forest Layout Engine
 * Positions trees in 3D space using fixed lot size fibonacci spiral
 */
export class ForestLayoutEngine {
  private config: ForestLayoutConfig;

  constructor(config: Partial<ForestLayoutConfig> = {}) {
    this.config = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  }

  /**
   * Position trees in 3D space
   * Sorts by effective MRR descending and places using fibonacci spiral with fixed lot size
   */
  positionTrees(trees: TreeData[]): PositionedTree[] {
    if (trees.length === 0) return [];

    // Sort by effective MRR descending (biggest trees first)
    const sortedTrees = [...trees].sort((a, b) => {
      const mrrA = a.mrrCents ?? a.revenueLast30DaysCents ?? 0;
      const mrrB = b.mrrCents ?? b.revenueLast30DaysCents ?? 0;
      return mrrB - mrrA;
    });

    const positionedTrees: PositionedTree[] = [];

    for (let i = 0; i < sortedTrees.length; i++) {
      const tree = sortedTrees[i];
      const spiral = fibonacciSpiral(i, this.config.lotSize);

      const position: TreePosition = {
        x: spiral.x,
        y: 0, // Trees are on ground level
        z: spiral.z,
      };

      positionedTrees.push({
        ...tree,
        position,
      });
    }

    return positionedTrees;
  }

  /**
   * Update the configuration
   */
  setConfig(config: Partial<ForestLayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ForestLayoutConfig {
    return { ...this.config };
  }
}
