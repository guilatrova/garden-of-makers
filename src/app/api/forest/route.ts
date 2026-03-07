import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { TreeService } from "@/lib/services/tree";
import { ForestLayoutEngine } from "@/lib/services/forest/ForestLayoutEngine";
import { mapRowToStartup, StartupRow } from "@/lib/utils/supabase/mappers";

export const revalidate = 3600;

/**
 * GET /api/forest
 * Reads all startups from Supabase and returns positioned forest data.
 * Optional: ?category=SaaS
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const supabase = createServiceClient();
    const treeService = new TreeService();
    const layoutEngine = new ForestLayoutEngine();

    // Query startups from Supabase
    let query = supabase
      .from("startups")
      .select("*")
      .order("revenue_last_30d_cents", { ascending: false });

    if (category) {
      query = query.ilike("category", category);
    }

    const { data: startups, error } = await query;

    if (error) {
      throw error;
    }

    if (!startups || startups.length === 0) {
      return NextResponse.json({
        trees: [],
        totalStartups: 0,
        categories: [],
        lastSyncedAt: null,
        _hint: "No startups in database. Trigger a sync via POST /api/sync",
      });
    }

    const rows = startups as unknown as StartupRow[];

    // Map DB rows → TrustMRRStartup format → TreeData
    const trees = rows.map((row) =>
      treeService.mapToTreeData(mapRowToStartup(row))
    );

    const positionedTrees = layoutEngine.positionTrees(trees);

    const categories = [
      ...new Set(rows.map((s) => s.category).filter(Boolean)),
    ].sort();

    const latestFetch = rows.reduce(
      (latest, s) =>
        s._last_fetch_at > latest ? s._last_fetch_at : latest,
      rows[0]._last_fetch_at
    );

    return NextResponse.json(
      {
        trees: positionedTrees,
        totalStartups: startups.length,
        categories,
        lastSyncedAt: latestFetch,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
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
