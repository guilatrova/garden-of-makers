import { NextResponse } from "next/server";
import { CacheService } from "@/lib/services/cache";
import { ForestData } from "@/lib/services/forest/types";

// Revalidate every hour (ISR)
export const revalidate = 3600;

const CACHE_KEY_FOREST = "forest_all";

/**
 * GET /api/forest
 * Returns forest data from cache.
 * Data is populated by POST /api/sync — this route never calls TrustMRR directly.
 * If cache is empty, returns empty forest with a hint to trigger sync.
 */
export async function GET() {
  try {
    const cacheService = new CacheService();

    // Always read from cache
    const cached = await cacheService.get<ForestData>(CACHE_KEY_FOREST);

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      });
    }

    // Cache empty — no sync has run yet
    return NextResponse.json(
      {
        trees: [],
        totalStartups: 0,
        categories: [],
        lastSyncedAt: null,
        _hint: "Cache is empty. Trigger a sync via POST /api/sync",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Forest API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch forest data",
        message: error instanceof Error ? error.message : "Unknown error",
        trees: [],
        totalStartups: 0,
        categories: [],
        lastSyncedAt: null,
      },
      { status: 500 }
    );
  }
}
