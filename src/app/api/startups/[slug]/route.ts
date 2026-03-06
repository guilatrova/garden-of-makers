import { NextResponse } from "next/server";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { CacheService } from "@/lib/services/cache";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/startups/[slug]
 * Returns single startup detail with caching
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const cacheKey = `startup_${slug}`;
    const cacheService = new CacheService();

    // Try to get from cache
    const cached = await cacheService.get<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached });
    }

    // Fetch from TrustMRR
    const provider = new TrustMRRProvider();
    const { response } = await provider.getStartup(slug);

    // Cache for 15 minutes
    await cacheService.set(cacheKey, response.data, 15);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Startup detail API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Handle specific error types
    if (errorMessage.includes("not found")) {
      return NextResponse.json(
        { error: "Startup not found", message: errorMessage },
        { status: 404 }
      );
    }

    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded", message: "Please try again later" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch startup", message: errorMessage },
      { status: 500 }
    );
  }
}
