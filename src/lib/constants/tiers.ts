import { TierConfig } from "@/lib/services/tree/types";

/**
 * Tree tier configurations
 * Based on PROJECT.md specification
 * 
 * MRR thresholds and visual parameters for each tree tier
 */

export const TIER_CONFIGS: TierConfig[] = [
  {
    tier: "seed",
    minMrrCents: 0,
    maxMrrCents: 0,
    relativeHeight: 0.3, // Ground level - visible dot
    trunkRadius: 0.1,
    canopyRadius: 0.2,
    hasSpecialEffects: false,
  },
  {
    tier: "sprout",
    minMrrCents: 1, // $0.01
    maxMrrCents: 10_000, // $100.00
    relativeHeight: 1, // 1x - tall grass
    trunkRadius: 0.15,
    canopyRadius: 0.5,
    hasSpecialEffects: false,
  },
  {
    tier: "shrub",
    minMrrCents: 10_001, // $100.01
    maxMrrCents: 100_000, // $1,000.00
    relativeHeight: 2, // 2x - dense bush
    trunkRadius: 0.3,
    canopyRadius: 1.0,
    hasSpecialEffects: false,
  },
  {
    tier: "young",
    minMrrCents: 100_001, // $1,000.01
    maxMrrCents: 500_000, // $5,000.00
    relativeHeight: 4, // 4x - thin birch
    trunkRadius: 0.5,
    canopyRadius: 1.5,
    hasSpecialEffects: false,
  },
  {
    tier: "mature",
    minMrrCents: 500_001, // $5,000.01
    maxMrrCents: 2_500_000, // $25,000.00
    relativeHeight: 8, // 8x - oak
    trunkRadius: 0.8,
    canopyRadius: 2.5,
    hasSpecialEffects: false,
  },
  {
    tier: "great",
    minMrrCents: 2_500_001, // $25,000.01
    maxMrrCents: 10_000_000, // $100,000.00
    relativeHeight: 15, // 15x - young sequoia
    trunkRadius: 1.2,
    canopyRadius: 3.5,
    hasSpecialEffects: false,
  },
  {
    tier: "ancient",
    minMrrCents: 10_000_001, // $100,000.01
    maxMrrCents: 50_000_000, // $500,000.00
    relativeHeight: 30, // 30x - mature sequoia
    trunkRadius: 2.0,
    canopyRadius: 5.0,
    hasSpecialEffects: true, // Visible from any point
  },
  {
    tier: "world",
    minMrrCents: 50_000_001, // $500,000.01
    maxMrrCents: null, // No upper limit
    relativeHeight: 60, // 60x+ - Yggdrasil
    trunkRadius: 4.0,
    canopyRadius: 8.0,
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
