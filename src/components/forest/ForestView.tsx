"use client";

/**
 * ForestView Component
 * Client component that holds ForestScene + overlay UI + state management
 */

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TreeData } from "@/lib/services/tree/types";
import { ForestScene } from "@/components/forest";
import { StartupDrawer } from "@/components/detail/StartupDrawer";
import { useForest } from "@/hooks/useForest";
import { Loader2 } from "lucide-react";

// Category filter button component
function CategoryFilter({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
        isActive
          ? "bg-green-500 text-white"
          : "bg-gray-800/80 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

export interface ForestViewProps {
  initialTrees?: TreeData[];
  initialTotalStartups?: number;
  initialCategories?: string[];
}

export function ForestView({
  initialTrees = [],
  initialTotalStartups = 0,
  initialCategories = [],
}: ForestViewProps) {
  const t = useTranslations("forest");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [flyMode, setFlyMode] = useState(false);

  const { trees, totalStartups, categories, isLoading, error } = useForest(
    selectedCategory
  );

  // Use server-fetched data initially, then client data
  const displayTrees = trees.length > 0 ? trees : initialTrees;
  const displayTotalStartups =
    totalStartups > 0 ? totalStartups : initialTotalStartups;
  const displayCategories =
    categories.length > 0 ? categories : initialCategories;

  const handleTreeClick = useCallback((tree: TreeData) => {
    setSelectedTree(tree);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedTree(null);
  }, []);

  const handleExitFly = useCallback(() => {
    setFlyMode(false);
  }, []);

  const enterFlyMode = useCallback(() => {
    setFlyMode(true);
    setSelectedTree(null);
  }, []);

  // Press F to toggle fly mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        setFlyMode((prev) => {
          if (!prev) setSelectedTree(null);
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 3D Canvas */}
      {isLoading && displayTrees.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-500" />
            <p className="text-lg text-green-400">{t("loading")}</p>
          </div>
        </div>
      ) : error && displayTrees.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg bg-red-900/50 p-8 text-center">
            <p className="text-lg text-red-300">{error}</p>
          </div>
        </div>
      ) : (
        <ForestScene
          trees={displayTrees}
          onTreeClick={handleTreeClick}
          flyMode={flyMode}
          onExitFly={handleExitFly}
        />
      )}

      {/* Overlay UI */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-left: Title and count */}
        <div className="pointer-events-auto absolute left-6 top-6">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {t("title")}
          </h1>
          <p className="text-sm text-green-400 drop-shadow">
            {t("startups", { count: displayTotalStartups })}
          </p>
        </div>

        {/* Top-right: Category filters */}
        {!flyMode && (
          <div className="pointer-events-auto absolute right-6 top-20 flex flex-wrap justify-end gap-2">
            <CategoryFilter
              label={t("filters.all")}
              isActive={selectedCategory === undefined}
              onClick={() => setSelectedCategory(undefined)}
            />
            {displayCategories.slice(0, 8).map((category) => (
              <CategoryFilter
                key={category}
                label={category}
                isActive={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </div>
        )}

        {/* Bottom-left: Fly mode button */}
        <div className="pointer-events-auto absolute bottom-6 left-6">
          <button
            onClick={() => (flyMode ? setFlyMode(false) : enterFlyMode())}
            className={`rounded-lg border px-5 py-2.5 font-['Silkscreen'] text-sm font-bold shadow-lg transition-all ${
              flyMode
                ? "border-green-400 bg-green-500 text-white"
                : "border-gray-600 bg-gray-900/90 text-green-400 hover:border-green-500 hover:bg-gray-800"
            }`}
          >
            {flyMode ? "ESC EXIT" : "FLY MODE"}
          </button>
        </div>

        {/* Bottom-center: Controls hint */}
        <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-900/90 px-6 py-3 shadow-xl backdrop-blur">
          <p className="text-center text-xs text-gray-400">
            {flyMode
              ? "Mouse to steer. W/S or mouse Y to climb/descend. Shift = boost. F or ESC to exit."
              : "Click & drag to orbit. Scroll to zoom. Click a tree for details. F to fly."}
          </p>
        </div>
      </div>

      {/* Startup Drawer */}
      {selectedTree && (
        <StartupDrawer startup={selectedTree} onClose={handleCloseDrawer} />
      )}
    </div>
  );
}

export default ForestView;
