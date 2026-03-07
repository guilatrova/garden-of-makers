import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { StartupRow } from "@/lib/utils/supabase/mappers";

/**
 * GET /api/startups
 * Queries startups directly from Supabase with filters and pagination.
 * All queries hit indexed columns.
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

    const supabase = createServiceClient();

    // Build query
    let query = supabase.from("startups").select("*", { count: "exact" });

    // Filters (all indexed)
    if (category) {
      query = query.ilike("category", category);
    }
    if (xHandle) {
      query = query.ilike("x_handle", xHandle);
    }
    if (onSale === "true") {
      query = query.eq("on_sale", true);
    } else if (onSale === "false") {
      query = query.eq("on_sale", false);
    }

    // Sorting (all indexed)
    switch (sort) {
      case "revenue-asc":
        query = query.order("revenue_last_30d_cents", { ascending: true });
        break;
      case "revenue-desc":
        query = query.order("revenue_last_30d_cents", { ascending: false });
        break;
      case "growth-desc":
        query = query.order("growth_30d", { ascending: false, nullsFirst: false });
        break;
      case "growth-asc":
        query = query.order("growth_30d", { ascending: true, nullsFirst: false });
        break;
      case "name-asc":
        query = query.order("name", { ascending: true });
        break;
      default:
        query = query.order("revenue_last_30d_cents", { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    const total = count ?? 0;
    const hasMore = from + limit < total;

    const rows = (data ?? []) as unknown as StartupRow[];

    return NextResponse.json({
      data: rows,
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
