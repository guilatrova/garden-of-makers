/**
 * ForestService
 * Reads forest data from Supabase startups table.
 * Falls back to single-page TrustMRR fetch if Supabase is empty.
 */

import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { mapRowToStartup, StartupRow } from "@/lib/utils/supabase/mappers";
import { ForestLayoutEngine } from "./ForestLayoutEngine";
import { ForestData, ForestServiceOptions } from "./types";

export class ForestService {
  private trustMRRProvider: TrustMRRProvider;
  private treeService: TreeService;
  private layoutEngine: ForestLayoutEngine;

  constructor() {
    this.trustMRRProvider = new TrustMRRProvider();
    this.treeService = new TreeService();
    this.layoutEngine = new ForestLayoutEngine();
  }

  async buildForest(options: ForestServiceOptions = {}): Promise<ForestData> {
    // Try Supabase first
    try {
      const supabase = createServiceClient();

      let query = supabase
        .from("startups")
        .select("*")
        .order("revenue_last_30d_cents", { ascending: false });

      if (options.category) {
        query = query.ilike("category", options.category);
      }

      const { data: rows, error } = await query;

      if (!error && rows && rows.length > 0) {
        const typedRows = rows as unknown as StartupRow[];
        const trees = typedRows.map((row) =>
          this.treeService.mapToTreeData(mapRowToStartup(row))
        );

        const positionedTrees = this.layoutEngine.positionTrees(trees);
        const categories = [
          ...new Set(typedRows.map((r) => r.category).filter(Boolean)),
        ].sort() as string[];

        const latestFetch = typedRows.reduce(
          (latest, r) =>
            r._last_fetch_at > latest ? r._last_fetch_at : latest,
          typedRows[0]._last_fetch_at
        );

        return {
          trees: positionedTrees,
          totalStartups: rows.length,
          categories,
          lastSyncedAt: latestFetch,
        };
      }
    } catch {
      // Supabase not configured or error — fall through
    }

    // Fallback: bootstrap with single page from TrustMRR
    try {
      const { response } = await this.trustMRRProvider.listStartups({
        page: 1,
        limit: 50,
        sort: "revenue-desc",
        category: options.category,
      });

      const categories = new Set<string>();
      for (const s of response.data) {
        if (s.category) categories.add(s.category);
      }

      const trees = response.data.map((s) => this.treeService.mapToTreeData(s));
      const positionedTrees = this.layoutEngine.positionTrees(trees);

      return {
        trees: positionedTrees,
        totalStartups: response.data.length,
        categories: Array.from(categories).sort(),
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("ForestService bootstrap fetch failed:", error);
      return {
        trees: [],
        totalStartups: 0,
        categories: [],
        lastSyncedAt: new Date().toISOString(),
      };
    }
  }
}

export const forestService = new ForestService();
