/**
 * ForestService
 * Orchestrates fetching data from TrustMRR and building the forest
 */

import { TrustMRRProvider, TrustMRRStartup } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { TreeData } from "@/lib/services/tree/types";
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

  /**
   * Build forest data by fetching all startups from TrustMRR
   * Paginates through all pages and positions trees
   */
  async buildForest(options: ForestServiceOptions = {}): Promise<ForestData> {
    const startups: TrustMRRStartup[] = [];
    const categories = new Set<string>();
    let page = 1;
    const limit = 50;
    let hasMore = true;

    try {
      // Fetch all pages from TrustMRR
      while (hasMore) {
        const { response, rateLimit } = await this.trustMRRProvider.listStartups({
          page,
          limit,
          sort: "revenue-desc",
          category: options.category,
        });

        startups.push(...response.data);

        // Collect unique categories
        for (const startup of response.data) {
          if (startup.category) {
            categories.add(startup.category);
          }
        }

        hasMore = response.meta.hasMore;
        page++;

        // Rate limit awareness - stop if we're running low
        if (rateLimit.remaining < 5) {
          console.warn(
            `TrustMRR rate limit low (${rateLimit.remaining} remaining). Stopping pagination.`
          );
          break;
        }

        // Safety limit - don't exceed 20 pages (1000 startups)
        if (page > 20) {
          console.warn("Reached maximum page limit (20). Stopping pagination.");
          break;
        }
      }
    } catch (error) {
      // Handle rate limit errors
      if (error instanceof Error && error.message.includes("rate limit")) {
        console.warn("TrustMRR rate limit exceeded. Returning partial data.");
      } else {
        console.error("Error fetching from TrustMRR:", error);
        throw error;
      }
    }

    // Map startups to TreeData (without positions initially)
    const treesWithoutPositions: TreeData[] = startups.map((startup) =>
      this.treeService.mapToTreeData(startup)
    );

    // Position trees using layout engine
    const positionedTrees = this.layoutEngine.positionTrees(treesWithoutPositions);

    return {
      trees: positionedTrees,
      totalStartups: startups.length,
      categories: Array.from(categories).sort(),
      lastSyncedAt: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const forestService = new ForestService();
