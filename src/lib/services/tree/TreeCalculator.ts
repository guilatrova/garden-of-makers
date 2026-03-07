import {
  TreeTier,
  TierConfig,
  FruitBreakdown,
  FruitType,
  TreeData,
} from "./types";
import { TIER_CONFIGS } from "@/lib/constants/tiers";
import { FRUIT_VALUES } from "@/lib/constants/fruits";

/**
 * Pure functions for tree calculations
 * No side effects - deterministic inputs/outputs
 */

/**
 * Calculate effective MRR for tier determination
 * Falls back to revenueLast30DaysCents if MRR is 0 (e.g., one-time products)
 */
export function getEffectiveMRR(mrrCents: number, revenueLast30DaysCents: number = 0): number {
  return mrrCents > 0 ? mrrCents : revenueLast30DaysCents;
}

/**
 * Get tree tier based on MRR in cents
 * Thresholds based on PROJECT.md specification
 * Uses effective MRR which falls back to 30-day revenue if MRR is 0
 */
export function getTier(mrr: number, revenueLast30Days: number = 0): TreeTier {
  const effectiveMRR = getEffectiveMRR(mrr, revenueLast30Days);

  if (effectiveMRR === 0) return "seed";
  if (effectiveMRR <= 100) return "sprout";
  if (effectiveMRR <= 1_000) return "shrub";
  if (effectiveMRR <= 5_000) return "young";
  if (effectiveMRR <= 25_000) return "mature";
  if (effectiveMRR <= 100_000) return "great";
  if (effectiveMRR <= 500_000) return "ancient";
  return "world";
}

/**
 * Get tier configuration for a given tier
 */
export function getTierConfig(tier: TreeTier): TierConfig {
  const config = TIER_CONFIGS.find((c) => c.tier === tier);
  if (!config) {
    throw new Error(`Unknown tree tier: ${tier}`);
  }
  return config;
}

/**
 * Calculate fruit breakdown from customer count
 * Uses greedy algorithm with largest denominations first
 * 
 * Example: 3524 customers
 * - 3 watermelons (3000)
 * - 5 oranges (500)
 * - 2 apples (20)
 * - 4 blueberries (4)
 */
export function getFruitBreakdown(customers: number): FruitBreakdown {
  // Handle edge cases
  if (customers <= 0) {
    return {
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    };
  }

  const watermelons = Math.floor(customers / FRUIT_VALUES.watermelon);
  const remaining1 = customers % FRUIT_VALUES.watermelon;

  const oranges = Math.floor(remaining1 / FRUIT_VALUES.orange);
  const remaining2 = remaining1 % FRUIT_VALUES.orange;

  const apples = Math.floor(remaining2 / FRUIT_VALUES.apple);
  const blueberries = remaining2 % FRUIT_VALUES.apple;

  return {
    watermelons,
    oranges,
    apples,
    blueberries,
  };
}

/**
 * Get the value of a specific fruit type
 */
export function getFruitValue(type: FruitType): number {
  return FRUIT_VALUES[type];
}

/**
 * Rate an on-sale tree deal based on ARR multiple (askingPrice / annualRevenue).
 * - "great": <= 2x ARR
 * - "good":  <= 3x ARR
 * - null:    not on sale, no price, no revenue, or multiple > 3x
 */
export type DealRating = "great" | "good";

export function getDealRating(tree: TreeData): DealRating | null {
  if (!tree.onSale || !tree.askingPriceCents || tree.askingPriceCents <= 0) return null;

  const monthlyRevenue = getEffectiveMRR(tree.mrrCents, tree.revenueLast30DaysCents);
  if (monthlyRevenue <= 0) return null;

  const arrMultiple = tree.askingPriceCents / (monthlyRevenue * 12);
  if (arrMultiple <= 2) return "great";
  if (arrMultiple <= 3) return "good";
  return null;
}

/**
 * Calculate total customers represented by a fruit breakdown
 * Useful for testing/validation
 */
export function calculateTotalCustomers(breakdown: FruitBreakdown): number {
  return (
    breakdown.watermelons * FRUIT_VALUES.watermelon +
    breakdown.oranges * FRUIT_VALUES.orange +
    breakdown.apples * FRUIT_VALUES.apple +
    breakdown.blueberries * FRUIT_VALUES.blueberry
  );
}
