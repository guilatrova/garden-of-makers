import { TierConfig } from "@/lib/services/tree/types";

/**
 * Tree tier configurations
 * Based on PROJECT.md specification
 *
 * MRR thresholds (in dollars) and visual parameters for each tree tier
 */

export const TIER_CONFIGS: TierConfig[] = [
  {
    tier: "seed",
    minMrr: 0,
    maxMrr: 0,
    relativeHeight: 0.3, // Ground level - visible dot
    trunkRadius: 0.1,
    canopyRadius: 0.5,
    hasSpecialEffects: false,
  },
  {
    tier: "sprout",
    minMrr: 1, // $1
    maxMrr: 100, // $100
    relativeHeight: 1, // 1x - tall grass
    trunkRadius: 0.15,
    canopyRadius: 1.5,
    hasSpecialEffects: false,
  },
  {
    tier: "shrub",
    minMrr: 101, // $101
    maxMrr: 1_000, // $1,000
    relativeHeight: 2, // 2x - dense bush
    trunkRadius: 0.3,
    canopyRadius: 3.0,
    hasSpecialEffects: false,
  },
  {
    tier: "young",
    minMrr: 1_001, // $1,001
    maxMrr: 5_000, // $5,000
    relativeHeight: 4, // 4x - thin birch
    trunkRadius: 0.5,
    canopyRadius: 4.0,
    hasSpecialEffects: false,
  },
  {
    tier: "mature",
    minMrr: 5_001, // $5,001
    maxMrr: 25_000, // $25,000
    relativeHeight: 8, // 8x - oak
    trunkRadius: 0.8,
    canopyRadius: 7.0,
    hasSpecialEffects: false,
  },
  {
    tier: "great",
    minMrr: 25_001, // $25,001
    maxMrr: 100_000, // $100,000
    relativeHeight: 15, // 15x - young sequoia
    trunkRadius: 1.2,
    canopyRadius: 12.0,
    hasSpecialEffects: false,
  },
  {
    tier: "ancient",
    minMrr: 100_001, // $100,001
    maxMrr: 500_000, // $500,000
    relativeHeight: 30, // 30x - mature sequoia
    trunkRadius: 2.0,
    canopyRadius: 20.0,
    hasSpecialEffects: true, // Visible from any point
  },
  {
    tier: "world",
    minMrr: 500_001, // $500,001
    maxMrr: null, // No upper limit
    relativeHeight: 60, // 60x+ - Yggdrasil
    trunkRadius: 4.0,
    canopyRadius: 35.0,
    hasSpecialEffects: true, // Massive, glow, roots, particles
  },
];

/**
 * Base height unit for trees (in 3D world units)
 * All relative heights are multiplied by this
 */
export const BASE_TREE_HEIGHT = 5; // meters/units

/**
 * Get config by tier name
 */
export function getTierConfigByName(tier: string): TierConfig | undefined {
  return TIER_CONFIGS.find((config) => config.tier === tier);
}
