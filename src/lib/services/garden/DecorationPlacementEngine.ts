/**
 * Decoration Placement Engine
 * Collision detection, bounds checking, and grid snapping for garden decorations.
 */

import { GardenPlot } from "./GardenLayoutEngine";
import { PlacedDecoration } from "@/components/garden/decorations/types";
import { getDecorationById } from "@/lib/constants/decorations";

const FENCE_MARGIN = 0.5;

/** Get footprint dimensions after rotation */
export function getRotatedFootprint(
  footprint: { width: number; depth: number },
  rotation: number
): { width: number; depth: number } {
  const r = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // 90 or 270 degrees: swap width and depth
  if (Math.abs(r - Math.PI / 2) < 0.1 || Math.abs(r - (3 * Math.PI) / 2) < 0.1) {
    return { width: footprint.depth, depth: footprint.width };
  }
  return { width: footprint.width, depth: footprint.depth };
}

/** Check if a decoration fits within the plot bounds */
export function isWithinPlot(
  position: { x: number; z: number },
  footprint: { width: number; depth: number },
  rotation: number,
  plot: GardenPlot
): boolean {
  const fp = getRotatedFootprint(footprint, rotation);
  const halfW = plot.width / 2 - FENCE_MARGIN;
  const halfD = plot.depth / 2 - FENCE_MARGIN;
  const halfFW = fp.width / 2;
  const halfFD = fp.depth / 2;

  return (
    position.x - halfFW >= -halfW &&
    position.x + halfFW <= halfW &&
    position.z - halfFD >= -halfD &&
    position.z + halfFD <= halfD
  );
}

/** Check if a new placement would overlap any existing placement */
export function hasCollision(
  position: { x: number; z: number },
  footprint: { width: number; depth: number },
  rotation: number,
  existingPlacements: PlacedDecoration[],
  /** Ignore this instance (for move operations) */
  ignoreInstanceId?: string
): boolean {
  const fp = getRotatedFootprint(footprint, rotation);

  for (const placed of existingPlacements) {
    if (ignoreInstanceId && placed.instanceId === ignoreInstanceId) continue;

    const def = getDecorationById(placed.decorationId);
    if (!def) continue;
    // Ambient decorations (footprint 0) don't collide
    if (def.footprint.width === 0 && def.footprint.depth === 0) continue;

    const placedFP = getRotatedFootprint(def.footprint, placed.rotation);

    const overlapX =
      Math.abs(position.x - placed.position.x) < (fp.width + placedFP.width) / 2;
    const overlapZ =
      Math.abs(position.z - placed.position.z) < (fp.depth + placedFP.depth) / 2;

    if (overlapX && overlapZ) return true;
  }

  return false;
}

/** Snap a position to the nearest grid point */
export function snapToGrid(
  position: { x: number; z: number },
  gridSize: number
): { x: number; z: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    z: Math.round(position.z / gridSize) * gridSize,
  };
}
