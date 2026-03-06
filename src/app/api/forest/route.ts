import { NextResponse } from "next/server";
import { ForestService } from "@/lib/services/forest";
import { CacheService } from "@/lib/services/cache";

// Revalidate every hour (ISR)
export const revalidate = 3600;

/**
 * GET /api/forest
 * Returns full forest data with tree positions
 * Supports optional ?category= filter
 * Uses caching with stale-while-revalidate pattern
 */
export async function GET(request: Request) {
  try {
    // Parse optional category filter
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;

    // Build cache key
    const cacheKey = category ? `forest_${category}` : "forest_all";

    const cacheService = new CacheService();
    const forestService = new ForestService();

    // Try to get from cache
    const cached = await cacheService.get<{
      trees: unknown[];
      totalStartups: number;
      categories: string[];
      lastSyncedAt: string;
    }>(cacheKey);

    if (cached) {
      // Check if cache is still fresh (less than 60 minutes old)
      const cacheAge = Date.now() - new Date(cached.lastSyncedAt).getTime();
      const maxAge = 60 * 60 * 1000; // 60 minutes

      if (cacheAge < maxAge) {
        // Cache hit and fresh
        return NextResponse.json(cached);
      }

      // Cache exists but is stale - return it and refresh in background
      // (In a real implementation, you might want to trigger a background refresh)
      console.log(`Returning stale cache for ${cacheKey}, refreshing...`);
    }

    // Cache miss or stale - fetch fresh data
    try {
      const forestData = await forestService.buildForest({ category });

      // Store in cache (60 minute TTL)
      await cacheService.set(cacheKey, forestData, 60);

      return NextResponse.json(forestData);
    } catch (error) {
      // If fetch fails but we have stale cache, return it
      if (cached) {
        console.warn("TrustMRR fetch failed, returning stale cache:", error);
        return NextResponse.json(cached);
      }

      // No cache and fetch failed
      throw error;
    }
  } catch (error) {
    console.error("Forest API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch forest data",
        message: errorMessage,
        trees: [],
        totalStartups: 0,
        categories: [],
        lastSyncedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
