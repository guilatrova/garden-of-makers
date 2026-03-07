/**
 * MakerGardenService
 * Fetches all products for a maker and builds their personal garden
 */

import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { TreeData } from "@/lib/services/tree/types";
import { ForestLayoutEngine } from "@/lib/services/forest/ForestLayoutEngine";
import { ForestData } from "@/lib/services/forest/types";
import { PositionedTree } from "@/lib/services/forest/types";
import { CacheService } from "@/lib/services/cache";
import {
  MakerGarden,
  MakerGardenServiceConfig,
  calculateGardenSize,
  calculateTotalMRR,
  calculateTotalCustomers,
  extractMakerInfo,
} from "./types";

export class MakerGardenService {
  private trustMRRProvider: TrustMRRProvider;
  private treeService: TreeService;
  private config: MakerGardenServiceConfig;

  constructor(
    trustMRRProvider?: TrustMRRProvider,
    treeService?: TreeService,
    config: MakerGardenServiceConfig = {}
  ) {
    this.trustMRRProvider = trustMRRProvider ?? new TrustMRRProvider();
    this.treeService = treeService ?? new TreeService();
    this.config = {
      defaultZoneRadius: 15,
      centerSpecialTrees: false,
      ...config,
    };
  }

  /**
   * Build a maker's garden from their xHandle
   * Fetches all products and positions them in a personal garden layout
   */
  async buildGarden(xHandle: string): Promise<MakerGarden | null> {
    // Normalize the handle (remove @ if present)
    const normalizedHandle = xHandle.replace("@", "");

    // Fetch all startups for this maker
    const allProducts = await this.fetchAllProductsForMaker(normalizedHandle);

    if (allProducts.length === 0) {
      return null;
    }

    // Get maker info from the first product's cofounders
    const firstProduct = allProducts[0];
    let xName: string | null = null;
    let xFollowerCount: number | null = null;

    try {
      // Fetch detail for first product to get cofounders data
      const { response } = await this.trustMRRProvider.getStartup(firstProduct.slug);
      const detail = response.data;
      xFollowerCount = detail.xFollowerCount;

      const makerInfo = extractMakerInfo(xHandle, detail.cofounders);
      xName = makerInfo.xName;
    } catch {
      // If detail fetch fails, continue with null values
    }

    // Position trees in a small, centered garden layout
    const positionedProducts = this.positionProductsInGarden(allProducts);

    // Calculate totals
    const totalMRR = calculateTotalMRR(positionedProducts);
    const totalCustomers = calculateTotalCustomers(positionedProducts);

    return {
      xHandle: normalizedHandle,
      xName,
      xFollowerCount,
      products: positionedProducts,
      totalMRR,
      totalCustomers,
      totalProducts: allProducts.length,
      gardenSize: calculateGardenSize(allProducts.length),
    };
  }

  /**
   * Fetch all products (startups) for a maker by xHandle.
   * First tries the synced forest cache (avoids TrustMRR API call).
   * Falls back to direct API call if cache miss.
   */
  private async fetchAllProductsForMaker(xHandle: string): Promise<TreeData[]> {
    // Try cache first
    const cacheService = new CacheService();
    const cachedForest = await cacheService.get<ForestData>("forest_all");

    if (cachedForest && cachedForest.trees.length > 0) {
      const fromCache = cachedForest.trees.filter(
        (t) => t.xHandle?.toLowerCase() === xHandle.toLowerCase()
      );
      if (fromCache.length > 0) {
        return fromCache;
      }
    }

    // Cache miss — call TrustMRR directly
    const allProducts: TreeData[] = [];
    let page = 1;
    const limit = 50;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const { response } = await this.trustMRRProvider.listStartups({
        xHandle,
        page,
        limit,
      });

      const mappedProducts = this.treeService.mapManyToTreeData(response.data);
      allProducts.push(...mappedProducts);

      hasMore = response.meta.hasMore;
      page++;

      if (allProducts.length >= 500) {
        break;
      }
    }

    return allProducts;
  }

  /**
   * Position products in a small, intimate garden layout
   * Uses a smaller zone radius than the full forest
   */
  private positionProductsInGarden(products: TreeData[]): PositionedTree[] {
    // Sort by MRR descending so largest trees are centered
    const sortedProducts = [...products].sort((a, b) => b.mrrCents - a.mrrCents);

    // Use smaller zone radius for intimate garden feel
    const layoutEngine = new ForestLayoutEngine({
      zoneRadius: this.config.defaultZoneRadius ?? 15,
      spacingMultiplier: 2.0,
      centerSpecialTrees: false, // Don't pull ancient/world trees to center in garden
    });

    return layoutEngine.positionTrees(sortedProducts);
  }
}
