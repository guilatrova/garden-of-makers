import { TrustMRRStartup } from "@/lib/providers/trustmrr";
import { TreeData } from "./types";
import { getTier, getFruitBreakdown } from "./TreeCalculator";

/**
 * TreeService - Maps TrustMRR startup data to TreeData
 * Handles the transformation from API data to visualization data
 */

export interface TreeServiceConfig {
  defaultPosition?: { x: number; y: number; z: number };
}

export class TreeService {
  private config: TreeServiceConfig;

  constructor(config: TreeServiceConfig = {}) {
    this.config = {
      defaultPosition: { x: 0, y: 0, z: 0 },
      ...config,
    };
  }

  /**
   * Map a TrustMRR startup to TreeData
   */
  mapToTreeData(startup: TrustMRRStartup, position?: { x: number; y: number; z: number }): TreeData {
    const tier = getTier(startup.revenue.mrr, startup.revenue.last30Days);
    // Use activeSubscriptions as fallback when customers is 0
    const effectiveCustomers = startup.customers > 0 ? startup.customers : startup.activeSubscriptions;
    const fruits = getFruitBreakdown(effectiveCustomers);

    return {
      slug: startup.slug,
      name: startup.name,
      icon: startup.icon,
      category: startup.category,
      paymentProvider: startup.paymentProvider,
      mrrCents: startup.revenue.mrr,
      revenueLast30DaysCents: startup.revenue.last30Days,
      totalRevenueCents: startup.revenue.total,
      customers: effectiveCustomers,
      activeSubscriptions: startup.activeSubscriptions,
      growth30d: startup.growth30d,
      onSale: startup.onSale,
      askingPriceCents: startup.askingPrice,
      xHandle: startup.xHandle,
      tier,
      fruits,
      position: position ?? this.config.defaultPosition ?? { x: 0, y: 0, z: 0 },
    };
  }

  /**
   * Map multiple startups to TreeData array
   */
  mapManyToTreeData(
    startups: TrustMRRStartup[],
    positions?: Array<{ x: number; y: number; z: number }>
  ): TreeData[] {
    return startups.map((startup, index) => {
      const position = positions?.[index];
      return this.mapToTreeData(startup, position);
    });
  }
}
