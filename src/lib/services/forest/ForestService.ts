/**
 * ForestService
 * Transforms startup data into a positioned 3D forest.
 * Data fetching is delegated to DataSyncer (cache-first facade).
 */

import { TrustMRRStartup } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { DataSyncer } from "@/lib/services/data";
import { ForestLayoutEngine } from "./ForestLayoutEngine";
import { ForestData, ForestServiceOptions } from "./types";

export class ForestService {
  private treeService: TreeService;
  private layoutEngine: ForestLayoutEngine;

  constructor(private syncer: DataSyncer) {
    this.treeService = new TreeService();
    this.layoutEngine = new ForestLayoutEngine();
  }

  async buildForest(options: ForestServiceOptions = {}): Promise<ForestData> {
    const startups = await this.syncer.getStartups(
      options.category ? { category: options.category } : undefined,
    );

    return this.buildFromStartups(startups);
  }

  private buildFromStartups(startups: TrustMRRStartup[]): ForestData {
    const trees = startups.map((s) => this.treeService.mapToTreeData(s));
    const positionedTrees = this.layoutEngine.positionTrees(trees);

    const categories = [
      ...new Set(startups.map((s) => s.category).filter(Boolean)),
    ].sort() as string[];

    return {
      trees: positionedTrees,
      totalStartups: startups.length,
      categories,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}
