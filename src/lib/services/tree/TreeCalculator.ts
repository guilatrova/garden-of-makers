import {
  TreeTier,
  TierConfig,
  FruitBreakdown,
  FruitType,
} from "./types";
import { TIER_CONFIGS } from "@/lib/constants/tiers";
import { FRUIT_VALUES } from "@/lib/constants/fruits";

/**
 * Pure functions for tree calculations
 * No side effects - deterministic inputs/outputs
 */

/**
 * Get tree tier based on MRR in cents
 * Thresholds based on PROJECT.md specification
 */
export function getTier(mrrCents: number): TreeTier {
  const mrr = mrrCents / 100; // convert cents to dollars

  if (mrr === 0) return "seed";
  if (mrr <= 100) return "sprout";
  if (mrr <= 1_000) return "shrub";
  if (mrr <= 5_000) return "young";
  if (mrr <= 25_000) return "mature";
  if (mrr <= 100_000) return "great";
  if (mrr <= 500_000) return "ancient";
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
