/**
 * SyncService
 * Handles incremental fetching of TrustMRR data and caching.
 * Designed to be called by a cron job or external trigger.
 * Respects rate limits by fetching in batches across multiple invocations.
 */

import { TrustMRRProvider, TrustMRRStartup } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { ForestLayoutEngine } from "@/lib/services/forest/ForestLayoutEngine";
import { ForestData } from "@/lib/services/forest/types";
import { CacheService } from "@/lib/services/cache";

const CACHE_KEY_FOREST = "forest_all";
const CACHE_KEY_SYNC_STATE = "sync_state";
const CACHE_KEY_RAW_STARTUPS = "raw_startups";
const CACHE_TTL_MINUTES = 120; // 2 hours
const PAGES_PER_RUN = 15; // Stay under 20 req/min rate limit
const PAGE_SIZE = 50;

interface SyncState {
  lastPage: number;
  totalPages: number | null;
  totalStartups: number;
  isComplete: boolean;
  lastRunAt: string;
  startedAt: string;
}

export interface SyncResult {
  status: "partial" | "complete" | "already_fresh";
  pagesProcessed: number;
  totalStartups: number;
  totalPages: number | null;
  currentPage: number;
  isComplete: boolean;
  duration: number;
}

export class SyncService {
  private provider: TrustMRRProvider;
  private treeService: TreeService;
  private layoutEngine: ForestLayoutEngine;
  private cache: CacheService;

  constructor() {
    this.provider = new TrustMRRProvider();
    this.treeService = new TreeService();
    this.layoutEngine = new ForestLayoutEngine();
    this.cache = new CacheService();
  }

  /**
   * Run an incremental sync batch.
   * Each invocation fetches up to PAGES_PER_RUN pages.
   * Call repeatedly until result.isComplete === true.
   */
  async runSync(): Promise<SyncResult> {
    const startTime = Date.now();

    // Get current sync state (or start fresh)
    let state = await this.cache.get<SyncState>(CACHE_KEY_SYNC_STATE);
    let rawStartups = await this.cache.get<TrustMRRStartup[]>(CACHE_KEY_RAW_STARTUPS);

    if (!state || state.isComplete) {
      // Start a new sync cycle
      state = {
        lastPage: 0,
        totalPages: null,
        totalStartups: 0,
        isComplete: false,
        lastRunAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
      };
      rawStartups = [];
    }

    if (!rawStartups) {
      rawStartups = [];
    }

    let pagesProcessed = 0;
    let currentPage = state.lastPage + 1;

    try {
      for (let i = 0; i < PAGES_PER_RUN; i++) {
        const { response, rateLimit } = await this.provider.listStartups({
          page: currentPage,
          limit: PAGE_SIZE,
          sort: "revenue-desc",
        });

        rawStartups.push(...response.data);
        pagesProcessed++;

        // Calculate total pages on first fetch
        if (state.totalPages === null) {
          state.totalPages = Math.ceil(response.meta.total / PAGE_SIZE);
        }

        if (!response.meta.hasMore) {
          state.isComplete = true;
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

    // Update state
    state.lastPage = currentPage - 1;
    state.totalStartups = rawStartups.length;
    state.lastRunAt = new Date().toISOString();

    // Save raw startups and state (long TTL so it survives between cron runs)
    await this.cache.set(CACHE_KEY_RAW_STARTUPS, rawStartups, CACHE_TTL_MINUTES);
    await this.cache.set(CACHE_KEY_SYNC_STATE, state, CACHE_TTL_MINUTES);

    // Build forest from whatever we have so far and cache it
    await this.buildAndCacheForest(rawStartups);

    const duration = Date.now() - startTime;

    return {
      status: state.isComplete ? "complete" : "partial",
      pagesProcessed,
      totalStartups: rawStartups.length,
      totalPages: state.totalPages,
      currentPage: state.lastPage,
      isComplete: state.isComplete,
      duration,
    };
  }

  /**
   * Reset sync state to force a full re-sync on next run.
   */
  async resetSync(): Promise<void> {
    await this.cache.invalidate(CACHE_KEY_SYNC_STATE);
    await this.cache.invalidate(CACHE_KEY_RAW_STARTUPS);
    await this.cache.invalidate(CACHE_KEY_FOREST);
  }

  /**
   * Build forest from raw startups and save to cache.
   * This is called after every sync batch so the forest
   * progressively improves.
   */
  private async buildAndCacheForest(
    startups: TrustMRRStartup[]
  ): Promise<void> {
    const categories = new Set<string>();

    for (const startup of startups) {
      if (startup.category) {
        categories.add(startup.category);
      }
    }

    const trees = startups.map((s) => this.treeService.mapToTreeData(s));
    const positionedTrees = this.layoutEngine.positionTrees(trees);

    const forestData: ForestData = {
      trees: positionedTrees,
      totalStartups: startups.length,
      categories: Array.from(categories).sort(),
      lastSyncedAt: new Date().toISOString(),
    };

    await this.cache.set(CACHE_KEY_FOREST, forestData, CACHE_TTL_MINUTES);
  }
}

export const syncService = new SyncService();
