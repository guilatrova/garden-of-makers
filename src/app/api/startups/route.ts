import { NextResponse } from "next/server";

/**
 * GET /api/startups
 * Returns list of startups (placeholder)
 * In production: fetches from TrustMRR with caching
 */
export async function GET() {
  // Placeholder - returns empty array
  // TODO: Implement with TrustMRRProvider and caching
  return NextResponse.json({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 50,
      hasMore: false,
    },
  });
}
