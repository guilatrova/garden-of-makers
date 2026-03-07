import { NextResponse } from "next/server";
import { CacheService } from "@/lib/services/cache";
import { ForestData } from "@/lib/services/forest/types";
import { TreeData } from "@/lib/services/tree/types";

const CACHE_KEY_FOREST = "forest_all";

/**
 * GET /api/startups
 * Returns startups from cache with optional filters.
 * No longer calls TrustMRR directly — reads from synced cache.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 50);
    const category = searchParams.get("category");
    const xHandle = searchParams.get("xHandle");
    const sort = searchParams.get("sort") ?? "revenue-desc";
    const onSale = searchParams.get("onSale");

    const cacheService = new CacheService();
    const cached = await cacheService.get<ForestData>(CACHE_KEY_FOREST);

    if (!cached) {
      return NextResponse.json({
        data: [],
        meta: { total: 0, page, limit, hasMore: false },
        _hint: "Cache is empty. Trigger a sync via POST /api/sync",
      });
    }

    // Filter
    let filtered: TreeData[] = [...cached.trees];

    if (category) {
      filtered = filtered.filter(
        (t) => t.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (xHandle) {
      filtered = filtered.filter(
        (t) => t.xHandle?.toLowerCase() === xHandle.toLowerCase()
      );
    }

    if (onSale === "true") {
      filtered = filtered.filter((t) => t.onSale);
    } else if (onSale === "false") {
      filtered = filtered.filter((t) => !t.onSale);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sort) {
        case "revenue-asc":
          return a.revenueLast30DaysCents - b.revenueLast30DaysCents;
        case "revenue-desc":
          return b.revenueLast30DaysCents - a.revenueLast30DaysCents;
        case "growth-desc":
          return (b.growth30d ?? 0) - (a.growth30d ?? 0);
        case "growth-asc":
          return (a.growth30d ?? 0) - (b.growth30d ?? 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return b.revenueLast30DaysCents - a.revenueLast30DaysCents;
      }
    });

    // Paginate
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < total;

    return NextResponse.json({
      data: paginated,
      meta: { total, page, limit, hasMore },
    });
  } catch (error) {
    console.error("Startups API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch startups",
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
        meta: { total: 0, page: 1, limit: 50, hasMore: false },
      },
      { status: 500 }
    );
  }
}
