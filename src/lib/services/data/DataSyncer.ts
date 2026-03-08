/**
 * DataSyncer
 * Cache-first facade: Supabase (persistent cache) + TrustMRR API (source of truth).
 *
 * Flow for every get():
 *   1. Read from Supabase
 *   2. If fresh (< STALE_MS) → return cached
 *   3. If stale or empty → fetch from API, upsert to Supabase, return fresh
 *   4. If API fails + stale data exists → return stale (stale-while-revalidate)
 *   5. If API fails + no data → throw
 */

import { TrustMRRProvider, TrustMRRStartup, TrustMRRStartupDetail } from "@/lib/providers/trustmrr";
import { mapRowToStartup, StartupRow } from "@/lib/utils/supabase/mappers";
import { SupabaseClient } from "@supabase/supabase-js";

const STALE_MS = 30 * 60 * 1000; // 30 minutes

interface CachedResult<T> {
  data: T | null;
  isStale: boolean;
  ageMs?: number;
}

type CacheOutcome = "fresh" | "stale-revalidated" | "stale-fallback" | "miss";

export class DataSyncer {
  constructor(
    private supabase: SupabaseClient,
    private api: TrustMRRProvider,
  ) {}

  async getStartups(opts?: { category?: string }): Promise<TrustMRRStartup[]> {
    return this.withCache("startups", {
      read: () => this.readStartups(opts?.category),
      fetch: () => this.fetchStartups(opts?.category),
      write: (data) => this.upsertStartups(data),
    });
  }

  async getStartupDetail(slug: string): Promise<TrustMRRStartupDetail> {
    return this.withCache(`detail:${slug}`, {
      read: () => this.readDetail(slug),
      fetch: () => this.fetchDetail(slug),
      write: (data) => this.writeDetail(data),
    });
  }

  // ─── Core pattern ───────────────────────────────────────────

  private async withCache<T>(label: string, ops: {
    read: () => Promise<CachedResult<T>>;
    fetch: () => Promise<T>;
    write: (data: T) => Promise<void>;
  }): Promise<T> {
    const start = Date.now();
    const cached = await ops.read();
    const cachedCount = Array.isArray(cached.data) ? cached.data.length : cached.data ? 1 : 0;
    let outcome: CacheOutcome;

    if (cached.data !== null && !cached.isStale) {
      outcome = "fresh";
      const ageMin = cached.ageMs != null ? (cached.ageMs / 60_000).toFixed(1) : "?";
      console.log(`[DataSyncer] ${label} → ${outcome} | ${cachedCount} rows | age: ${ageMin}min | ${Date.now() - start}ms`);
      return cached.data;
    }

    try {
      const fresh = await ops.fetch();
      const freshCount = Array.isArray(fresh) ? fresh.length : 1;
      await ops.write(fresh);
      outcome = cached.data !== null ? "stale-revalidated" : "miss";
      console.log(`[DataSyncer] ${label} → ${outcome} | cached: ${cachedCount} → fetched: ${freshCount} | upserted ${freshCount} rows | ${Date.now() - start}ms`);
      return fresh;
    } catch (error) {
      if (cached.data !== null) {
        outcome = "stale-fallback";
        const ageMin = cached.ageMs != null ? (cached.ageMs / 60_000).toFixed(1) : "?";
        console.warn(`[DataSyncer] ${label} → ${outcome} | ${cachedCount} rows | age: ${ageMin}min | error: ${error instanceof Error ? error.message : error}`);
        return cached.data;
      }
      console.error(`[DataSyncer] ${label} → miss + API failed | ${Date.now() - start}ms`);
      throw error;
    }
  }

  // ─── Startups (Supabase-backed) ─────────────────────────────

  private async readStartups(category?: string): Promise<CachedResult<TrustMRRStartup[]>> {
    try {
      let query = this.supabase
        .from("startups")
        .select("*")
        .order("revenue_last_30d_cents", { ascending: false });

      if (category) {
        query = query.ilike("category", category);
      }

      const { data: rows, error } = await query;

      if (error || !rows || rows.length === 0) {
        return { data: null, isStale: true };
      }

      const typedRows = rows as unknown as StartupRow[];
      const startups = typedRows.map(mapRowToStartup);

      const latestFetch = typedRows.reduce(
        (latest, r) => (r._last_fetch_at > latest ? r._last_fetch_at : latest),
        typedRows[0]._last_fetch_at,
      );
      const ageMs = Date.now() - new Date(latestFetch).getTime();
      const isStale = ageMs > STALE_MS;

      return { data: startups, isStale, ageMs };
    } catch {
      return { data: null, isStale: true };
    }
  }

  private async fetchStartups(category?: string): Promise<TrustMRRStartup[]> {
    const { response } = await this.api.listStartups({
      page: 1,
      limit: 50,
      sort: "revenue-desc",
      category,
    });
    return response.data;
  }

  private async upsertStartups(startups: TrustMRRStartup[]): Promise<void> {
    if (startups.length === 0) return;

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
    const { error } = await (this.supabase.from("startups") as any).upsert(rows, {
      onConflict: "slug",
    });

    if (error) {
      console.error("[DataSyncer] upsert startups error:", error);
    }
  }

  // ─── Startup Detail (in-memory, no Supabase table for details) ──

  private static detailCache = new Map<string, { data: TrustMRRStartupDetail; fetchedAt: number }>();

  private async readDetail(slug: string): Promise<CachedResult<TrustMRRStartupDetail>> {
    const entry = DataSyncer.detailCache.get(slug);
    if (!entry) return { data: null, isStale: true };

    const ageMs = Date.now() - entry.fetchedAt;
    const isStale = ageMs > STALE_MS;
    return { data: entry.data, isStale, ageMs };
  }

  private async fetchDetail(slug: string): Promise<TrustMRRStartupDetail> {
    const { response } = await this.api.getStartup(slug);
    return response.data;
  }

  private async writeDetail(data: TrustMRRStartupDetail): Promise<void> {
    DataSyncer.detailCache.set(data.slug, { data, fetchedAt: Date.now() });
  }
}
