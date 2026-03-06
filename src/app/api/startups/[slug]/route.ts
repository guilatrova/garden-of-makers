import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/startups/[slug]
 * Returns single startup detail (placeholder)
 * In production: fetches from TrustMRR with caching
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;

  // Placeholder - returns not found
  // TODO: Implement with TrustMRRProvider and caching
  return NextResponse.json(
    {
      error: "Not implemented",
      message: `Startup detail for ${slug} not yet implemented`,
    },
    { status: 501 }
  );
}
