/**
 * Garden Layout Engine
 * Positions trees around a central rectangular plot.
 * Priority: front-center first, then sides, then back.
 * Designed for future expansion (decorations, buildings inside the plot).
 */

import { TreeData } from "@/lib/services/tree/types";
import { PositionedTree } from "@/lib/services/forest/types";

export interface GardenPlot {
  width: number;
  depth: number;
}

/** Plot scales with product count */
function getPlotDimensions(productCount: number): GardenPlot {
  if (productCount <= 2) return { width: 20, depth: 14 };
  if (productCount <= 5) return { width: 30, depth: 20 };
  if (productCount <= 10) return { width: 40, depth: 25 };
  return { width: 50, depth: 30 };
}

const MARGIN = 8; // gap from plot edge to first tree ring
const SPACING = 14; // between trees

/**
 * Generate positions around a rectangular plot.
 * Fills front row first (center-out), then sides, then back.
 * Expands to outer rings if needed.
 */
function generatePositions(
  count: number,
  plot: GardenPlot
): { x: number; z: number }[] {
  const positions: { x: number; z: number }[] = [];

  for (let ring = 0; positions.length < count && ring < 4; ring++) {
    const ringGap = ring * SPACING;
    const halfW = plot.width / 2 + MARGIN + ringGap;
    const halfD = plot.depth / 2 + MARGIN + ringGap;

    // Front row (positive Z — camera-facing)
    addCenterOutRow(positions, count, halfD, halfW);

    // Sides (alternating right/left, front to back)
    for (let i = 1; positions.length < count; i++) {
      const z = halfD - i * SPACING;
      if (z < -halfD) break;
      positions.push({ x: halfW, z });
      if (positions.length < count) {
        positions.push({ x: -halfW, z });
      }
    }

    // Back row (negative Z)
    addCenterOutRow(positions, count, -halfD, halfW);
  }

  return positions.slice(0, count);
}

/** Add a row at z, starting from center and alternating left/right */
function addCenterOutRow(
  positions: { x: number; z: number }[],
  maxCount: number,
  z: number,
  halfW: number
) {
  if (positions.length >= maxCount) return;
  positions.push({ x: 0, z });

  for (let i = 1; positions.length < maxCount; i++) {
    const x = i * SPACING;
    if (x > halfW) break;
    positions.push({ x, z });
    if (positions.length < maxCount) {
      positions.push({ x: -x, z });
    }
  }
}

/**
 * Position trees around a rectangular garden plot.
 * Sorts by MRR descending so the biggest tree is front-center.
 */
export function positionTreesInGarden(trees: TreeData[]): {
  products: PositionedTree[];
  plot: GardenPlot;
} {
  if (trees.length === 0)
    return { products: [], plot: { width: 20, depth: 14 } };

  const sorted = [...trees].sort((a, b) => {
    const mrrA = a.mrr || a.revenueLast30Days || 0;
    const mrrB = b.mrr || b.revenueLast30Days || 0;
    return mrrB - mrrA;
  });

  const plot = getPlotDimensions(sorted.length);
  const positions = generatePositions(sorted.length, plot);

  const products: PositionedTree[] = sorted.map((tree, i) => ({
    ...tree,
    position: { x: positions[i].x, y: 0, z: positions[i].z },
  }));

  return { products, plot };
}
