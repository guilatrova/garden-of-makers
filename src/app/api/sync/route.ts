import { NextResponse } from "next/server";
import { syncService } from "@/lib/services/sync";

/**
 * POST /api/sync
 * Triggers an incremental sync of TrustMRR data.
 * Each call fetches up to 15 pages (750 startups).
 * Call repeatedly until response.isComplete === true.
 *
 * Designed to be called by:
 * - Vercel Cron Jobs (vercel.json)
 * - External cron services (cron-job.org, etc.)
 * - OpenClaw cron
 * - Manual trigger from dashboard
 *
 * Optional: Pass ?reset=true to force a full re-sync.
 *
 * Security: In production, protect with a secret header:
 *   Authorization: Bearer <SYNC_SECRET>
 */
export async function POST(request: Request) {
  try {
    // Optional: verify sync secret in production
    const syncSecret = process.env.SYNC_SECRET;
    if (syncSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${syncSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const reset = searchParams.get("reset") === "true";

    if (reset) {
      await syncService.resetSync();
    }

    const result = await syncService.runSync();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Sync API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Sync failed",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Also support GET for simple cron services that only do GET
export async function GET(request: Request) {
  return POST(request);
}
