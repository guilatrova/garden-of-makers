"use client";

/**
 * PlacementGrid
 * Visual grid overlay inside the garden plot during placement mode.
 */

import { GardenPlot } from "@/lib/services/garden/GardenLayoutEngine";

interface PlacementGridProps {
  plot: GardenPlot;
  gridSize?: number;
}

export function PlacementGrid({ plot, gridSize = 1 }: PlacementGridProps) {
  return (
    <gridHelper
      args={[
        Math.max(plot.width, plot.depth),
        Math.round(Math.max(plot.width, plot.depth) / gridSize),
        "#4ade80",
        "#4ade8030",
      ]}
      position={[0, 0.04, 0]}
    />
  );
}
