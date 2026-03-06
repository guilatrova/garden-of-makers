/**
 * Shared global types
 */

// Forest data types
export interface ForestData {
  trees: TreeData[];
  totalStartups: number;
  categories: string[];
  lastSyncedAt: string;
}

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
  tier: TreeTier;
  fruits: FruitBreakdown;
  position: { x: number; y: number; z: number };
}

export type TreeTier =
  | "seed"
  | "sprout"
  | "shrub"
  | "young"
  | "mature"
  | "great"
  | "ancient"
  | "world";

export interface FruitBreakdown {
  watermelons: number;
  oranges: number;
  apples: number;
  blueberries: number;
}
