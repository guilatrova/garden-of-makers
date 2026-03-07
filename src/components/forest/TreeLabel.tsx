"use client";

/**
 * TreeLabel Component
 * HTML overlay showing tree info on hover/click
 */

import { Html } from "@react-three/drei";
import { TreeData } from "@/lib/services/tree/types";
import { getCategoryDisplayName, getCategoryColor } from "@/lib/constants/categories";
import { formatRevenue } from "@/lib/utils/format";

export interface TreeLabelProps {
  data: TreeData;
  visible: boolean;
  position: [number, number, number];
}

/**
 * Get growth indicator
 */
function getGrowthIndicator(growth: number | null): string {
  if (growth === null) return "—";
  const percentage = (growth * 100).toFixed(0);
  return growth > 0 ? `+${percentage}%` : `${percentage}%`;
}

export function TreeLabel({ data, visible, position }: TreeLabelProps) {
  if (!visible) return null;

  const categoryName = getCategoryDisplayName(data.category);
  const categoryColor = getCategoryColor(data.category);
  const mrrFormatted = formatRevenue(data.mrrCents);
  const growthIndicator = getGrowthIndicator(data.growth30d);
  const growthPositive = data.growth30d !== null && data.growth30d > 0;

  return (
    <Html position={position} center distanceFactor={10}>
      <div
        className="pointer-events-none select-none rounded-lg border-2 border-gray-700 bg-gray-900/95 px-3 py-2 text-center shadow-lg"
        style={{ fontFamily: "'Silkscreen', monospace" }}
      >
        {/* Tree name */}
        <div className="mb-1 text-sm font-bold text-white">{data.name}</div>

        {/* MRR */}
        <div className="mb-1 text-lg font-bold text-green-400">{mrrFormatted}</div>

        {/* Category badge */}
        <div className="mb-1 flex justify-center">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${categoryColor}33`,
              color: categoryColor,
              border: `1px solid ${categoryColor}`,
            }}
          >
            {categoryName}
          </span>
        </div>

        {/* Growth indicator */}
        <div
          className={`text-xs font-medium ${
            growthPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {growthIndicator} / month
        </div>

        {/* For sale badge */}
        {data.onSale && (
          <div className="mt-1 text-xs font-bold text-yellow-400">FOR SALE</div>
        )}
      </div>
    </Html>
  );
}

export default TreeLabel;
