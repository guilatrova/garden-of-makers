import { NextResponse } from "next/server";
import { MakerGardenService } from "@/lib/services/garden";

/**
 * GET /api/garden/[xHandle]
 * Returns a maker's garden data with all their products.
 * Reads from Supabase (x_handle indexed), falls back to TrustMRR API.
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
    const makerGardenService = new MakerGardenService();
    const garden = await makerGardenService.buildGarden(xHandle);

    if (!garden) {
      return NextResponse.json(
        { error: "Maker not found", xHandle },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: garden,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(`Garden API error for xHandle "${xHandle}":`, error);

    return NextResponse.json(
      {
        error: "Failed to fetch garden data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
