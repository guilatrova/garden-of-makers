"use client";

/**
 * useForest Hook
 * Fetches forest data from /api/forest
 */

import { useState, useEffect, useCallback } from "react";
import { TreeData } from "@/lib/services/tree/types";

interface ForestData {
  trees: TreeData[];
  totalStartups: number;
  categories: string[];
  lastSyncedAt: string;
}

interface UseForestReturn {
  trees: TreeData[];
  totalStartups: number;
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useForest(category?: string): UseForestReturn {
  const [data, setData] = useState<ForestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = category
        ? `/api/forest?category=${encodeURIComponent(category)}`
        : "/api/forest";

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const forestData = await response.json();
      setData(forestData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch forest data";
      setError(message);
      console.error("useForest error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchForest();
  }, [fetchForest]);

  return {
    trees: data?.trees ?? [],
    totalStartups: data?.totalStartups ?? 0,
    categories: data?.categories ?? [],
    isLoading,
    error,
    refetch: fetchForest,
  };
}
