/**
 * Tree Service Types
 * Domain types for tree generation and visualization
 */

// === Tree Tiers ===
export type TreeTier =
  | "seed"
  | "sprout"
  | "shrub"
  | "young"
  | "mature"
  | "great"
  | "ancient"
  | "world";

export interface TierConfig {
  tier: TreeTier;
  minMrrCents: number;
  maxMrrCents: number | null;
  relativeHeight: number; // 1x, 2x, 5x, 12x, 25x, 50x, 100x
  trunkRadius: number;
  canopyRadius: number;
  hasSpecialEffects: boolean; // true for ancient + world
}

// === Fruits ===
export type FruitType = "blueberry" | "apple" | "orange" | "watermelon";

export interface FruitBreakdown {
  watermelons: number; // each = 1,000 customers
  oranges: number; // each = 100 customers
  apples: number; // each = 10 customers
  blueberries: number; // each = 1 customer
}

// === Tree (rendered in 3D) ===
export interface TreeData {
  slug: string;
  name: string;
  icon: string | null;
  category: string | null;
  paymentProvider: string;
  mrrCents: number;
  revenueLast30DaysCents: number;
  totalRevenueCents: number;
  customers: number;
  activeSubscriptions: number;
  growth30d: number | null;
  onSale: boolean;
  askingPriceCents: number | null;
  xHandle: string | null;
  // Computed
  tier: TreeTier;
  fruits: FruitBreakdown;
  position: { x: number; y: number; z: number };
}
