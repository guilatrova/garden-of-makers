import { NextResponse } from "next/server";
import { MakerGardenService } from "@/lib/services/garden";
import { CacheService } from "@/lib/services/cache";

/**
 * GET /api/garden/[xHandle]
 * Returns a maker's garden data with all their products
 * Cached for 30 minutes
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ xHandle: string }> }
) {
  const { xHandle } = await params;

  if (!xHandle) {
    return NextResponse.json(
      { error: "xHandle is required" },
      { status: 400 }
    );
  }

  try {
    const cacheService = new CacheService();
    const cacheKey = `garden_${xHandle}`;

    // Check cache first (30 min TTL)
    const cached = await cacheService.get<MakerGardenResponse>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Build the garden
    const makerGardenService = new MakerGardenService();
    const garden = await makerGardenService.buildGarden(xHandle);

    if (!garden) {
      return NextResponse.json(
        { error: "Maker not found", xHandle },
        { status: 404 }
      );
    }

    // Prepare response
    const response: MakerGardenResponse = {
      data: garden,
      meta: {
        cached: false,
        timestamp: new Date().toISOString(),
      },
    };

    // Cache the result (30 min TTL)
    await cacheService.set(cacheKey, response, 30);

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Garden API error for xHandle "${xHandle}":`, error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch garden data",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Response type for API
interface MakerGardenResponse {
  data: {
    xHandle: string;
    xName: string | null;
    xFollowerCount: number | null;
    products: unknown[];
    totalMRR: number;
    totalCustomers: number;
    totalProducts: number;
    gardenSize: string;
  };
  meta: {
    cached: boolean;
    timestamp: string;
  };
}
