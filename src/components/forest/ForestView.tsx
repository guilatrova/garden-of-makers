"use client";

/**
 * ForestView Component
 * Client component that holds ForestScene + overlay UI + state management
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { TreeData } from "@/lib/services/tree/types";
import { ForestScene } from "@/components/forest";
import { StartupDrawer } from "@/components/detail/StartupDrawer";
import { useForest } from "@/hooks/useForest";
import { Loader2, MousePointerClick, Move, ChevronUp, ChevronDown, Zap, Unlock } from "lucide-react";

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
        <ForestScene trees={displayTrees} onTreeClick={handleTreeClick} />
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
        <div className="pointer-events-auto absolute right-6 top-6 flex flex-wrap justify-end gap-2">
          <CategoryFilter
            label={t("filters.all")}
            isActive={selectedCategory === undefined}
            onClick={() => setSelectedCategory(undefined)}
          />
          {displayCategories.slice(0, 6).map((category) => (
            <CategoryFilter
              key={category}
              label={t(`filters.${category}`) || category}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {/* Bottom-center: Flight controls legend */}
        <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-900/90 px-6 py-4 shadow-xl backdrop-blur">
          <h3 className="mb-3 text-center text-sm font-semibold text-white">
            {t("controls.title")}
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Move className="h-3 w-3" />
              <span>{t("controls.move")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-3 w-3" />
              <span>{t("controls.look")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                <ChevronUp className="h-3 w-3" />
                <ChevronDown className="h-3 w-3" />
              </div>
              <span>{t("controls.upDown")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>{t("controls.boost")}</span>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-2">
              <Unlock className="h-3 w-3" />
              <span>{t("controls.escape")}</span>
            </div>
          </div>
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
