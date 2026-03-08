"use client";

/**
 * DecorationCatalog
 * HTML overlay panel for browsing and selecting decorations to place.
 */

import { useState } from "react";
import { Flower2, ChevronDown, Lock } from "lucide-react";
import {
  DECORATION_CATALOG,
  type DecorationTier,
  type DecorationDefinition,
} from "@/lib/constants/decorations";

const TIER_ORDER: { key: DecorationTier; label: string }[] = [
  { key: "seed", label: "Starter" },
  { key: "growth", label: "Growth" },
  { key: "scaling", label: "Scaling" },
  { key: "premium", label: "Premium" },
  { key: "special", label: "Special" },
];

function formatMRR(mrr: number): string {
  if (mrr >= 1000) return `$${(mrr / 1000).toFixed(0)}k`;
  return `$${mrr}`;
}

interface DecorationCatalogProps {
  mrr: number;
  onSelectDecoration: (id: string) => void;
  placementMode: boolean;
  onCancelPlacement: () => void;
}

export function DecorationCatalog({
  mrr,
  onSelectDecoration,
  placementMode,
  onCancelPlacement,
}: DecorationCatalogProps) {
  const [open, setOpen] = useState(false);

  if (placementMode) {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 px-4 py-2 text-xs text-gray-300">
          <span>Click on the plot to place</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">R to rotate</span>
          <button
            onClick={onCancelPlacement}
            className="rounded bg-red-600/80 px-2 py-0.5 text-white hover:bg-red-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-gray-900/80 px-3 py-2 text-xs font-medium text-gray-300 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/90 transition-colors"
      >
        <Flower2 className="h-3.5 w-3.5" />
        Decorate
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-2 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 p-3 w-64 max-h-[360px] overflow-y-auto">
          {TIER_ORDER.map(({ key, label }) => {
            const items = DECORATION_CATALOG.filter((d) => d.tier === key);
            if (items.length === 0) return null;

            return (
              <div key={key} className="mb-3 last:mb-0">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
                  {label}
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <DecorationItem
                      key={item.id}
                      item={item}
                      unlocked={mrr >= item.minMRR}
                      onSelect={() => {
                        onSelectDecoration(item.id);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DecorationItem({
  item,
  unlocked,
  onSelect,
}: {
  item: DecorationDefinition;
  unlocked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={unlocked ? onSelect : undefined}
      disabled={!unlocked}
      className={`w-full flex items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors ${
        unlocked
          ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 cursor-pointer"
          : "bg-gray-800/20 text-gray-600 cursor-not-allowed"
      }`}
    >
      <span className="text-sm flex-shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{item.name}</div>
        <div className="text-[10px] text-gray-500 truncate">
          {item.description}
        </div>
      </div>
      {!unlocked && (
        <div className="flex items-center gap-1 text-[10px] text-gray-600 flex-shrink-0">
          <Lock className="h-2.5 w-2.5" />
          {formatMRR(item.minMRR)}
        </div>
      )}
    </button>
  );
}
