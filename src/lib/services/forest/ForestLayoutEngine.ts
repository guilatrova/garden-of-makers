/**
 * Forest Layout Engine
 * Positions trees in 3D space based on category zones
 */

import { TreeData, TreeTier } from "@/lib/services/tree/types";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import {
  getZoneForCategory,
  ZONE_CENTERS,
  BiomeZone,
} from "@/lib/constants/categories";
import {
  TreePosition,
  PositionedTree,
  ForestLayoutConfig,
  DEFAULT_LAYOUT_CONFIG,
} from "./types";

/**
 * Calculate position using fibonacci spiral for natural distribution
 */
export function fibonacciSpiral(
  index: number,
  count: number,
  radius: number
): { x: number; z: number } {
  if (count <= 1) return { x: 0, z: 0 };

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const r = radius * Math.sqrt(index / (count - 1));
  const theta = index * goldenAngle;

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
 * Get the canopy radius for a tree
 */
export function getTreeCanopyRadius(tree: TreeData): number {
  try {
    const config = getTierConfig(tree.tier);
    return config.canopyRadius;
  } catch {
    // Fallback for unknown tier
    return 0.5;
  }
}

/**
 * Check if a position conflicts with existing trees
 */
export function hasPositionConflict(
  position: TreePosition,
  existingTrees: PositionedTree[],
  newTreeRadius: number,
  config: ForestLayoutConfig
): boolean {
  for (const tree of existingTrees) {
    const otherRadius = getTreeCanopyRadius(tree);
    const minDistance =
      Math.max(newTreeRadius, otherRadius) * config.spacingMultiplier;
    const actualDistance = getDistance(position, tree.position);

    if (actualDistance < minDistance) {
      return true;
    }
  }
  return false;
}

/**
 * Find a valid position for a tree, trying spiral points with jitter
 */
export function findValidPosition(
  tree: TreeData,
  zoneCenter: { x: number; z: number },
  indexInZone: number,
  totalInZone: number,
  existingTrees: PositionedTree[],
  config: ForestLayoutConfig
): TreePosition {
  const treeRadius = getTreeCanopyRadius(tree);
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    // Calculate base spiral position
    const spiral = fibonacciSpiral(
      indexInZone,
      Math.max(totalInZone, 1),
      config.zoneRadius * (1 + attempts * 0.1) // Expand radius on retry
    );

    // Add slight jitter for natural look (increasing with attempts)
    const jitterAmount = 0.1 + attempts * 0.05;
    const jitterX = (Math.random() - 0.5) * jitterAmount * config.zoneRadius;
    const jitterZ = (Math.random() - 0.5) * jitterAmount * config.zoneRadius;

    const position: TreePosition = {
      x: zoneCenter.x + spiral.x + jitterX,
      y: 0, // Trees are on ground level
      z: zoneCenter.z + spiral.z + jitterZ,
    };

    if (!hasPositionConflict(position, existingTrees, treeRadius, config)) {
      return position;
    }

    attempts++;
  }

  // Fallback: return position with expanded radius even if it conflicts
  const fallbackSpiral = fibonacciSpiral(
    indexInZone,
    Math.max(totalInZone, 1),
    config.zoneRadius * 1.5
  );

  return {
    x: zoneCenter.x + fallbackSpiral.x,
    y: 0,
    z: zoneCenter.z + fallbackSpiral.z,
  };
}

/**
 * Check if a tree is ancient or world tier
 */
export function isSpecialTree(tier: TreeTier): boolean {
  return tier === "ancient" || tier === "world";
}

/**
 * Forest Layout Engine
 * Positions trees in 3D space based on category zones
 */
export class ForestLayoutEngine {
  private config: ForestLayoutConfig;

  constructor(config: Partial<ForestLayoutConfig> = {}) {
    this.config = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  }

  /**
   * Position trees in 3D space
   * Groups by category, sorts by MRR, and places using fibonacci spiral
   */
  positionTrees(trees: TreeData[]): PositionedTree[] {
    if (trees.length === 0) return [];

    const positionedTrees: PositionedTree[] = [];

    // Separate special trees (ancient/world) if centering is enabled
    const specialTrees: TreeData[] = [];
    const normalTrees: TreeData[] = [];

    for (const tree of trees) {
      if (this.config.centerSpecialTrees && isSpecialTree(tree.tier)) {
        specialTrees.push(tree);
      } else {
        normalTrees.push(tree);
      }
    }

    // Position special trees at world center (with smaller radius for clustering)
    if (specialTrees.length > 0) {
      // Sort by MRR descending (biggest trees first)
      specialTrees.sort((a, b) => b.mrrCents - a.mrrCents);

      const centerZone = ZONE_CENTERS.center;
      // Use a smaller effective zone radius for special trees so they cluster near center
      const specialTreeConfig: ForestLayoutConfig = {
        ...this.config,
        zoneRadius: 20, // Smaller radius for special trees
      };

      for (let i = 0; i < specialTrees.length; i++) {
        const tree = specialTrees[i];
        const position = findValidPosition(
          tree,
          centerZone,
          i,
          specialTrees.length,
          positionedTrees,
          specialTreeConfig
        );

        positionedTrees.push({
          ...tree,
          position,
        });
      }
    }

    // Group normal trees by category
    const treesByZone = new Map<BiomeZone, TreeData[]>();

    for (const tree of normalTrees) {
      const zone = getZoneForCategory(tree.category);
      const existing = treesByZone.get(zone) ?? [];
      existing.push(tree);
      treesByZone.set(zone, existing);
    }

    // Position trees in each zone
    for (const [zone, zoneTrees] of treesByZone) {
      // Sort by MRR descending (biggest trees at zone center)
      zoneTrees.sort((a, b) => b.mrrCents - a.mrrCents);

      const zoneCenter = ZONE_CENTERS[zone];

      for (let i = 0; i < zoneTrees.length; i++) {
        const tree = zoneTrees[i];
        const position = findValidPosition(
          tree,
          zoneCenter,
          i,
          zoneTrees.length,
          positionedTrees,
          this.config
        );

        positionedTrees.push({
          ...tree,
          position,
        });
      }
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
