import { NextResponse } from "next/server";
import { DataSyncer } from "@/lib/services/data";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/startups/[slug]
 * Returns single startup detail (cache-first via DataSyncer)
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 },
      );
    }

    const syncer = new DataSyncer(createServiceClient(), new TrustMRRProvider());
    const detail = await syncer.getStartupDetail(slug);

    return NextResponse.json({ data: detail });
  } catch (error) {
    console.error("Startup detail API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("not found")) {
      return NextResponse.json(
        { error: "Startup not found", message: errorMessage },
        { status: 404 },
      );
    }

    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded", message: "Please try again later" },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch startup", message: errorMessage },
      { status: 500 },
    );
  }
}
