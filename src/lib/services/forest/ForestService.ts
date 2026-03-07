/**
 * ForestService
 * Reads forest data from cache. Data is populated by SyncService.
 * Falls back to a single-page fetch from TrustMRR if cache is empty.
 */

import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { CacheService } from "@/lib/services/cache";
import { ForestLayoutEngine } from "./ForestLayoutEngine";
import { ForestData, ForestServiceOptions } from "./types";

const CACHE_KEY_FOREST = "forest_all";

export class ForestService {
  private trustMRRProvider: TrustMRRProvider;
  private treeService: TreeService;
  private layoutEngine: ForestLayoutEngine;
  private cache: CacheService;

  constructor() {
    this.trustMRRProvider = new TrustMRRProvider();
    this.treeService = new TreeService();
    this.layoutEngine = new ForestLayoutEngine();
    this.cache = new CacheService();
  }

  /**
   * Get forest data. Reads from cache first.
   * If cache is empty, does a single-page fetch as bootstrap.
   */
  async buildForest(options: ForestServiceOptions = {}): Promise<ForestData> {
    // Try cache first
    const cached = await this.cache.get<ForestData>(CACHE_KEY_FOREST);
    if (cached && cached.trees.length > 0) {
      // Apply category filter on cached data if needed
      if (options.category) {
        return {
          ...cached,
          trees: cached.trees.filter(
            (t) => t.category?.toLowerCase() === options.category?.toLowerCase()
          ),
          totalStartups: cached.trees.filter(
            (t) => t.category?.toLowerCase() === options.category?.toLowerCase()
          ).length,
        };
      }
      return cached;
    }

    // Cache empty — bootstrap with a single page fetch
    // (SyncService will fill the full dataset on next run)
    try {
      const { response } = await this.trustMRRProvider.listStartups({
        page: 1,
        limit: 50,
        sort: "revenue-desc",
        category: options.category,
      });

      const categories = new Set<string>();
      for (const startup of response.data) {
        if (startup.category) {
          categories.add(startup.category);
        }
      }

      const trees = response.data.map((s) => this.treeService.mapToTreeData(s));
      const positionedTrees = this.layoutEngine.positionTrees(trees);

      const forestData: ForestData = {
        trees: positionedTrees,
        totalStartups: response.data.length,
        categories: Array.from(categories).sort(),
        lastSyncedAt: new Date().toISOString(),
      };

      // Cache bootstrap data (short TTL — sync will replace it)
      await this.cache.set(CACHE_KEY_FOREST, forestData, 30);

      return forestData;
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
