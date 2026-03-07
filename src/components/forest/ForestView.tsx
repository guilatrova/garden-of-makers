"use client";

/**
 * ForestView Component
 * Client component that holds ForestScene + overlay UI + state management
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { TreeData } from "@/lib/services/tree/types";
import { ForestScene } from "@/components/forest";
import { StartupDrawer } from "@/components/detail/StartupDrawer";
import { useForest } from "@/hooks/useForest";
import { Loader2, Search } from "lucide-react";
import LoadingScreen, { type LoadingStage } from "./LoadingScreen";

let hasPlayedLoadingGlobal = false;

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
  const [exploreMode, setExploreMode] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchFocusSlug, setSearchFocusSlug] = useState<string | null>(null);

  const skipLoading = useRef(hasPlayedLoadingGlobal);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>(
    skipLoading.current ? "done" : "loading"
  );

  const { trees, totalStartups, categories, isLoading, error } = useForest(
    selectedCategory
  );

  // Use server-fetched data initially, then client data
  const displayTrees = trees.length > 0 ? trees : initialTrees;
  const displayTotalStartups =
    totalStartups > 0 ? totalStartups : initialTotalStartups;
  const displayCategories =
    categories.length > 0 ? categories : initialCategories;

  const showMenu = !exploreMode && !flyMode;

  const handleTreeClick = useCallback((tree: TreeData) => {
    setSelectedTree(tree);
    setExploreMode(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedTree(null);
  }, []);

  const handleExitFly = useCallback(() => {
    setFlyMode(false);
    setExploreMode(true);
  }, []);

  const enterFlyMode = useCallback(() => {
    setFlyMode(true);
    setExploreMode(true);
    setSelectedTree(null);
    setSearchFocusSlug(null);
  }, []);

  const enterExploreMode = useCallback(() => {
    setExploreMode(true);
    setSearchFocusSlug(null);
  }, []);

  // Sibling products: trees sharing the same xHandle as the selected tree
  const siblingProducts = useMemo(() => {
    if (!selectedTree?.xHandle) return [];
    const handle = selectedTree.xHandle.replace("@", "").toLowerCase();
    return displayTrees.filter(
      (t) => t.xHandle?.replace("@", "").toLowerCase() === handle
    );
  }, [selectedTree, displayTrees]);

  const siblingIndex = useMemo(() => {
    if (!selectedTree || siblingProducts.length <= 1) return 0;
    return siblingProducts.findIndex((t) => t.slug === selectedTree.slug);
  }, [selectedTree, siblingProducts]);

  const navigateToSibling = useCallback(
    (direction: 1 | -1) => {
      if (siblingProducts.length <= 1) return;
      const nextIdx =
        (siblingIndex + direction + siblingProducts.length) %
        siblingProducts.length;
      const next = siblingProducts[nextIdx];
      setSelectedTree(next);
      setSearchFocusSlug(next.slug);
    },
    [siblingProducts, siblingIndex]
  );

  // Search by twitter handle
  const handleSearch = useCallback(() => {
    setSearchError(null);
    const query = searchQuery.trim().replace(/^@/, "").toLowerCase();
    if (!query) return;

    const found = displayTrees.find(
      (t) => t.xHandle?.toLowerCase() === query || t.slug?.toLowerCase() === query || t.name?.toLowerCase().includes(query)
    );

    if (found) {
      setSearchFocusSlug(found.slug);
      setExploreMode(true);
      setSelectedTree(found);
    } else {
      setSearchError(`No tree found for "${query}"`);
    }
  }, [searchQuery, displayTrees]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  // Loading screen: transition to "ready" after data arrives + brief delay
  const hasData = displayTrees.length > 0;
  useEffect(() => {
    if (!hasData || skipLoading.current) return;
    const timer = setTimeout(() => {
      setLoadingStage((prev) => (prev === "loading" ? "ready" : prev));
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasData]);

  const handleLoadingComplete = useCallback(() => {
    setLoadingStage("done");
    hasPlayedLoadingGlobal = true;
  }, []);

  // Press F to toggle fly mode, ESC to go back to menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in search
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.key === "f" || e.key === "F") {
        if (flyMode) {
          setFlyMode(false);
          setExploreMode(true);
        } else {
          enterFlyMode();
        }
      }
      if (e.key === "Escape") {
        if (flyMode) {
          setFlyMode(false);
          setExploreMode(true);
        } else if (exploreMode) {
          setExploreMode(false);
          setSearchFocusSlug(null);
          setSelectedTree(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flyMode, exploreMode, enterFlyMode]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Loading Screen overlay */}
      {!skipLoading.current && (
        <LoadingScreen
          stage={loadingStage}
          onFadeComplete={handleLoadingComplete}
        />
      )}

      {/* 3D Canvas */}
      {displayTrees.length > 0 ? (
        <ForestScene
          trees={displayTrees}
          onTreeClick={handleTreeClick}
          flyMode={flyMode}
          onExitFly={handleExitFly}
          holdGrowth={loadingStage === "loading"}
          externalFocusSlug={searchFocusSlug}
        />
      ) : isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-500" />
            <p className="text-lg text-green-400">{t("loading")}</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg bg-red-900/50 p-8 text-center">
            <p className="text-lg text-red-300">{error}</p>
          </div>
        </div>
      ) : null}

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

        {/* ── Center Menu (shown when not exploring/flying) ── */}
        {showMenu && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center">
            {/* Search bar */}
            <div className="mb-8 flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError(null);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search any Twitter/X handle"
                  className="w-[320px] rounded border border-gray-600 bg-gray-900/90 px-4 py-3 pr-10 font-['Silkscreen'] text-sm text-white placeholder-gray-500 outline-none backdrop-blur transition-colors focus:border-green-500"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
              <button
                onClick={handleSearch}
                className="rounded border border-green-500 bg-green-600 px-5 py-3 font-['Silkscreen'] text-sm font-bold text-white transition-all hover:bg-green-500"
              >
                SEARCH
              </button>
            </div>

            {searchError && (
              <p className="mb-4 font-['Silkscreen'] text-xs text-red-400">
                {searchError}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={enterExploreMode}
                className="rounded-lg border border-green-500/50 bg-green-600/80 px-8 py-4 font-['Silkscreen'] text-base font-bold text-white shadow-lg shadow-green-900/40 transition-all hover:bg-green-500 hover:shadow-green-800/60"
              >
                EXPLORE FOREST
              </button>
              <button
                onClick={enterFlyMode}
                className="rounded-lg border border-gray-500/50 bg-gray-800/80 px-8 py-4 font-['Silkscreen'] text-base font-bold text-green-400 shadow-lg transition-all hover:border-green-500/50 hover:bg-gray-700 hover:text-white"
              >
                FLY
              </button>
            </div>
          </div>
        )}

        {/* ── Explore/Fly mode UI ── */}
        {!showMenu && (
          <>
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

            {/* Bottom-left: Mode buttons */}
            <div className="pointer-events-auto absolute bottom-6 left-6 flex gap-3">
              <button
                onClick={() => {
                  setExploreMode(false);
                  setFlyMode(false);
                  setSelectedTree(null);
                  setSearchFocusSlug(null);
                }}
                className="rounded-lg border border-gray-600 bg-gray-900/90 px-4 py-2.5 font-['Silkscreen'] text-sm font-bold text-gray-400 shadow-lg transition-all hover:border-gray-400 hover:text-white"
              >
                BACK
              </button>
              <button
                onClick={() =>
                  flyMode ? handleExitFly() : enterFlyMode()
                }
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
                  : "Click & drag to orbit. Scroll to zoom. Click a tree for details. F to fly. ESC to go back."}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Startup Drawer */}
      {selectedTree && (
        <StartupDrawer
          startup={selectedTree}
          onClose={handleCloseDrawer}
          siblingCount={siblingProducts.length}
          siblingIndex={siblingIndex}
          onNextProduct={() => navigateToSibling(1)}
          onPrevProduct={() => navigateToSibling(-1)}
        />
      )}
    </div>
  );
}

export default ForestView;
