/**
 * MakerGardenService
 * Builds a maker's garden from Supabase (x_handle indexed query).
 * Falls back to TrustMRR API if Supabase has no results.
 */

import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { TreeData } from "@/lib/services/tree/types";
import { ForestLayoutEngine } from "@/lib/services/forest/ForestLayoutEngine";
import { PositionedTree } from "@/lib/services/forest/types";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { mapRowToStartup, StartupRow } from "@/lib/utils/supabase/mappers";
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

  async buildGarden(xHandle: string): Promise<MakerGarden | null> {
    const normalizedHandle = xHandle.replace("@", "");

    const allProducts = await this.fetchAllProductsForMaker(normalizedHandle);

    if (allProducts.length === 0) {
      return null;
    }

    // Get maker info
    let xName: string | null = null;
    let xFollowerCount: number | null = null;

    try {
      // Try Supabase first for cofounder data
      const supabase = createServiceClient();
      const firstProduct = allProducts[0];

      const { data: detail } = await supabase
        .from("startup_details")
        .select("x_follower_count")
        .eq("startup_id", firstProduct.slug)
        .single();

      if (detail) {
        const d = detail as unknown as { x_follower_count: number | null };
        xFollowerCount = d.x_follower_count;
      }

      const { data: cofounders } = await supabase
        .from("startup_cofounders")
        .select("x_handle, x_name")
        .ilike("x_handle", normalizedHandle);

      if (cofounders && cofounders.length > 0) {
        const c = cofounders as unknown as Array<{ x_handle: string; x_name: string | null }>;
        xName = c[0].x_name;
      }
    } catch {
      // If Supabase fails, try API for detail
      try {
        const { response } = await this.trustMRRProvider.getStartup(allProducts[0].slug);
        xFollowerCount = response.data.xFollowerCount;
        const makerInfo = extractMakerInfo(xHandle, response.data.cofounders);
        xName = makerInfo.xName;
      } catch {
        // Continue with null values
      }
    }

    const positionedProducts = this.positionProductsInGarden(allProducts);
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
   * Fetch products for a maker. Queries Supabase by x_handle (indexed).
   * Falls back to TrustMRR API if Supabase returns nothing.
   */
  private async fetchAllProductsForMaker(xHandle: string): Promise<TreeData[]> {
    try {
      const supabase = createServiceClient();

      const { data: rows, error } = await supabase
        .from("startups")
        .select("*")
        .ilike("x_handle", xHandle)
        .order("revenue_last_30d_cents", { ascending: false });

      if (!error && rows && rows.length > 0) {
        const typedRows = rows as unknown as StartupRow[];
        return typedRows.map((row) =>
          this.treeService.mapToTreeData(mapRowToStartup(row))
        );
      }
    } catch {
      // Supabase not available, fall through to API
    }

    // Fallback: call TrustMRR directly
    const allProducts: TreeData[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const { response } = await this.trustMRRProvider.listStartups({
        xHandle,
        page,
        limit: 50,
      });

      allProducts.push(...this.treeService.mapManyToTreeData(response.data));
      hasMore = response.meta.hasMore;
      page++;

      if (allProducts.length >= 500) break;
    }

    return allProducts;
  }

  private positionProductsInGarden(products: TreeData[]): PositionedTree[] {
    const sortedProducts = [...products].sort((a, b) => b.mrrCents - a.mrrCents);

    const layoutEngine = new ForestLayoutEngine({
      zoneRadius: this.config.defaultZoneRadius ?? 15,
      spacingMultiplier: 2.0,
      centerSpecialTrees: false,
    });

    return layoutEngine.positionTrees(sortedProducts);
  }
}
