import { NextResponse } from "next/server";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TrustMRRListParams } from "@/lib/providers/trustmrr/types";

/**
 * GET /api/startups
 * Proxies requests to TrustMRR API
 * No caching here - use /api/forest for cached forest data
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params: TrustMRRListParams = {
      page: parseInt(searchParams.get("page") ?? "1", 10),
      limit: Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 50),
    };

    // Optional filters
    const sort = searchParams.get("sort");
    if (sort) params.sort = sort as TrustMRRListParams["sort"];

    const category = searchParams.get("category");
    if (category) params.category = category;

    const minMrr = searchParams.get("minMrr");
    if (minMrr) params.minMrr = parseInt(minMrr, 10);

    const maxMrr = searchParams.get("maxMrr");
    if (maxMrr) params.maxMrr = parseInt(maxMrr, 10);

    const xHandle = searchParams.get("xHandle");
    if (xHandle) params.xHandle = xHandle;

    const onSale = searchParams.get("onSale");
    if (onSale) params.onSale = onSale as "true" | "false";

    // Fetch from TrustMRR
    const provider = new TrustMRRProvider();
    const { response } = await provider.listStartups(params);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Startups API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Handle specific error types
    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Please try again later",
          data: [],
          meta: { total: 0, page: 1, limit: 50, hasMore: false },
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch startups",
        message: errorMessage,
        data: [],
        meta: { total: 0, page: 1, limit: 50, hasMore: false },
      },
      { status: 500 }
    );
  }
}
