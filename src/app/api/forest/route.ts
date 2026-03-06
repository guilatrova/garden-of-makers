import { NextResponse } from "next/server";

/**
 * GET /api/forest
 * Returns full forest data with tree positions (placeholder)
 * In production: fetches from TrustMRR, calculates positions, caches result
 */
export async function GET() {
  // Placeholder - returns empty forest
  // TODO: Implement with ForestService, TreeService, and caching
  return NextResponse.json({
    trees: [],
    totalStartups: 0,
    categories: [],
    lastSyncedAt: new Date().toISOString(),
  });
}
