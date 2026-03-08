import { NextResponse } from "next/server";
import { DataSyncer } from "@/lib/services/data";
import { ForestService } from "@/lib/services/forest";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";

export const revalidate = 3600;

/**
 * GET /api/forest
 * Returns positioned forest data. Optional: ?category=SaaS
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;

    const syncer = new DataSyncer(createServiceClient(), new TrustMRRProvider());
    const forestService = new ForestService(syncer);
    const forestData = await forestService.buildForest({ category });

    return NextResponse.json(forestData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
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
      { status: 500 },
    );
  }
}
