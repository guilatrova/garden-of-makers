/**
 * SyncService
 * Incrementally fetches TrustMRR data and persists to Supabase tables.
 * Respects rate limits by fetching in batches across multiple invocations.
 */

import { TrustMRRProvider, TrustMRRStartup } from "@/lib/providers/trustmrr";
import { createServiceClient } from "@/lib/utils/supabase/server";

const PAGES_PER_RUN = 15;
const PAGE_SIZE = 50;

export interface SyncResult {
  status: "partial" | "complete" | "error";
  pagesProcessed: number;
  startupsUpserted: number;
  totalPages: number | null;
  currentPage: number;
  isComplete: boolean;
  duration: number;
}

export class SyncService {
  private provider: TrustMRRProvider;

  constructor() {
    this.provider = new TrustMRRProvider();
  }

  /**
   * Run an incremental sync batch.
   * Each invocation fetches up to PAGES_PER_RUN pages and upserts to Supabase.
   */
  async runSync(): Promise<SyncResult> {
    const startTime = Date.now();
    const supabase = createServiceClient();

    // Get or create sync state
    const { data: rawState } = await supabase
      .from("sync_state")
      .select("*")
      .eq("sync_key", "main")
      .single();

    const stateRow = rawState as unknown as {
      last_page: number;
      total_pages: number | null;
      is_complete: boolean;
    } | null;

    let lastPage = stateRow?.last_page ?? 0;
    let totalPages = stateRow?.total_pages ?? null;
    const isAlreadyComplete = stateRow?.is_complete ?? false;

    // If previous sync completed, start fresh
    if (isAlreadyComplete) {
      lastPage = 0;
      totalPages = null;
    }

    let pagesProcessed = 0;
    let startupsUpserted = 0;
    let currentPage = lastPage + 1;
    let syncComplete = false;

    try {
      for (let i = 0; i < PAGES_PER_RUN; i++) {
        const { response, rateLimit } = await this.provider.listStartups({
          page: currentPage,
          limit: PAGE_SIZE,
          sort: "revenue-desc",
        });

        // Calculate total pages on first fetch
        if (totalPages === null) {
          totalPages = Math.ceil(response.meta.total / PAGE_SIZE);
        }

        // Upsert startups to Supabase
        const upserted = await this.upsertStartups(supabase, response.data);
        startupsUpserted += upserted;
        pagesProcessed++;

        if (!response.meta.hasMore) {
          syncComplete = true;
          break;
        }

        currentPage++;

        // Stop if rate limit is getting low
        if (rateLimit.remaining < 3) {
          console.warn(
            `SyncService: Rate limit low (${rateLimit.remaining}). Pausing at page ${currentPage}.`
          );
          break;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("rate limit")) {
        console.warn("SyncService: Rate limit hit. Will resume on next run.");
      } else {
        throw error;
      }
    }

    // Update sync state
    const syncStatePayload = {
      sync_key: "main",
      last_page: currentPage - (syncComplete ? 0 : 1),
      total_pages: totalPages,
      total_startups: startupsUpserted,
      is_complete: syncComplete,
      last_run_at: new Date().toISOString(),
      ...(isAlreadyComplete || !stateRow
        ? { started_at: new Date().toISOString() }
        : {}),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("sync_state") as any).upsert(syncStatePayload, {
      onConflict: "sync_key",
    });

    return {
      status: syncComplete ? "complete" : "partial",
      pagesProcessed,
      startupsUpserted,
      totalPages,
      currentPage,
      isComplete: syncComplete,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Reset sync state to force a full re-sync.
   */
  async resetSync(): Promise<void> {
    const supabase = createServiceClient();
    await supabase.from("sync_state").delete().eq("sync_key", "main");
    // Optionally clear all startups:
    // await supabase.from("startups").delete().neq("slug", "");
  }

  /**
   * Upsert startups from TrustMRR API response into Supabase.
   * Uses slug as the conflict key.
   */
  private async upsertStartups(
    supabase: ReturnType<typeof createServiceClient>,
    startups: TrustMRRStartup[]
  ): Promise<number> {
    if (startups.length === 0) return 0;

    const rows = startups.map((s) => ({
      slug: s.slug,
      name: s.name,
      icon: s.icon,
      description: s.description,
      website: s.website,
      country: s.country,
      founded_date: s.foundedDate,
      category: s.category,
      payment_provider: s.paymentProvider,
      target_audience: s.targetAudience,
      mrr_cents: Math.round(s.revenue.mrr),
      revenue_last_30d_cents: Math.round(s.revenue.last30Days),
      revenue_total_cents: Math.round(s.revenue.total),
      customers: s.customers,
      active_subscriptions: s.activeSubscriptions,
      growth_30d: s.growth30d,
      profit_margin_last_30d: s.profitMarginLast30Days,
      multiple: s.multiple,
      on_sale: s.onSale,
      asking_price_cents: s.askingPrice ? Math.round(s.askingPrice) : null,
      first_listed_for_sale_at: s.firstListedForSaleAt,
      x_handle: s.xHandle,
      _last_fetch_at: new Date().toISOString(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("startups") as any).upsert(rows, {
      onConflict: "slug",
    });

    if (error) {
      console.error("SyncService upsert error:", error);
      throw error;
    }

    return rows.length;
  }
}

export const syncService = new SyncService();
