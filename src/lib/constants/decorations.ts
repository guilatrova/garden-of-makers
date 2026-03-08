/**
 * Decoration Catalog
 * All available decorations for maker gardens, gated by MRR.
 */

export type DecorationSize = "small" | "medium" | "large" | "xlarge";
export type DecorationTier = "seed" | "growth" | "scaling" | "premium" | "special";

export interface DecorationDefinition {
  id: string;
  name: string;
  tier: DecorationTier;
  size: DecorationSize;
  minMRR: number;
  footprint: { width: number; depth: number };
  description: string;
  emoji: string;
  animated: boolean;
}

export const DECORATION_CATALOG: DecorationDefinition[] = [
  // ─── Seed tier ($0-100) ────────────────────────────
  {
    id: "flower_bed",
    name: "Flower Bed",
    tier: "seed",
    size: "small",
    minMRR: 0,
    footprint: { width: 2, depth: 2 },
    description: "A colorful patch of low-poly flowers",
    emoji: "🌸",
    animated: false,
  },
  {
    id: "rock",
    name: "Rock",
    tier: "seed",
    size: "small",
    minMRR: 0,
    footprint: { width: 1.5, depth: 1.5 },
    description: "A decorative boulder",
    emoji: "🪨",
    animated: false,
  },
  {
    id: "signpost",
    name: "Signpost",
    tier: "seed",
    size: "small",
    minMRR: 0,
    footprint: { width: 1, depth: 1 },
    description: "Welcome to your garden!",
    emoji: "🪧",
    animated: false,
  },
  {
    id: "bench",
    name: "Bench",
    tier: "seed",
    size: "small",
    minMRR: 0,
    footprint: { width: 3, depth: 1.5 },
    description: "A cozy wooden bench",
    emoji: "🪑",
    animated: false,
  },
  {
    id: "mushroom_cluster",
    name: "Mushrooms",
    tier: "seed",
    size: "small",
    minMRR: 0,
    footprint: { width: 1.5, depth: 1.5 },
    description: "A cluster of cute mushrooms",
    emoji: "🍄",
    animated: false,
  },

  // ─── Growth tier ($100-1k) ─────────────────────────
  {
    id: "lantern",
    name: "Lantern",
    tier: "growth",
    size: "small",
    minMRR: 100,
    footprint: { width: 1, depth: 1 },
    description: "A glowing lamp post",
    emoji: "🏮",
    animated: true,
  },
  {
    id: "scarecrow",
    name: "Scarecrow",
    tier: "growth",
    size: "medium",
    minMRR: 100,
    footprint: { width: 2, depth: 2 },
    description: "A friendly garden scarecrow",
    emoji: "🧑‍🌾",
    animated: false,
  },
  {
    id: "hedge",
    name: "Hedge",
    tier: "growth",
    size: "medium",
    minMRR: 250,
    footprint: { width: 4, depth: 1.5 },
    description: "A shaped topiary hedge",
    emoji: "🌿",
    animated: false,
  },
  {
    id: "pond",
    name: "Pond",
    tier: "growth",
    size: "medium",
    minMRR: 500,
    footprint: { width: 4, depth: 3 },
    description: "A tranquil water pond",
    emoji: "💧",
    animated: true,
  },
  {
    id: "swing",
    name: "Swing",
    tier: "growth",
    size: "medium",
    minMRR: 500,
    footprint: { width: 2, depth: 3 },
    description: "A wooden garden swing",
    emoji: "🎪",
    animated: true,
  },

  // ─── Scaling tier ($1k-10k) ────────────────────────
  {
    id: "fountain",
    name: "Fountain",
    tier: "scaling",
    size: "large",
    minMRR: 1000,
    footprint: { width: 4, depth: 4 },
    description: "An elegant water fountain",
    emoji: "⛲",
    animated: true,
  },
  {
    id: "windmill",
    name: "Windmill",
    tier: "scaling",
    size: "large",
    minMRR: 2000,
    footprint: { width: 4, depth: 4 },
    description: "A spinning windmill",
    emoji: "🌀",
    animated: true,
  },
  {
    id: "bridge",
    name: "Bridge",
    tier: "scaling",
    size: "large",
    minMRR: 3000,
    footprint: { width: 6, depth: 2 },
    description: "A wooden bridge",
    emoji: "🌉",
    animated: false,
  },
  {
    id: "campfire",
    name: "Campfire",
    tier: "scaling",
    size: "medium",
    minMRR: 1000,
    footprint: { width: 2, depth: 2 },
    description: "A warm crackling campfire",
    emoji: "🔥",
    animated: true,
  },
  {
    id: "animals",
    name: "Animals",
    tier: "scaling",
    size: "medium",
    minMRR: 5000,
    footprint: { width: 3, depth: 3 },
    description: "Chickens and a dog roaming around",
    emoji: "🐔",
    animated: true,
  },

  // ─── Premium tier ($10k+) ──────────────────────────
  {
    id: "gazebo",
    name: "Gazebo",
    tier: "premium",
    size: "xlarge",
    minMRR: 10000,
    footprint: { width: 6, depth: 6 },
    description: "A grand garden gazebo",
    emoji: "🏛️",
    animated: false,
  },
  {
    id: "statue",
    name: "Statue",
    tier: "premium",
    size: "large",
    minMRR: 15000,
    footprint: { width: 2, depth: 2 },
    description: "A golden trophy statue",
    emoji: "🏆",
    animated: true,
  },
  {
    id: "hot_air_balloon",
    name: "Hot Air Balloon",
    tier: "premium",
    size: "large",
    minMRR: 20000,
    footprint: { width: 3, depth: 3 },
    description: "A balloon floating above your garden",
    emoji: "🎈",
    animated: true,
  },
  {
    id: "rocket",
    name: "Rocket",
    tier: "premium",
    size: "large",
    minMRR: 25000,
    footprint: { width: 2, depth: 2 },
    description: "To the moon!",
    emoji: "🚀",
    animated: true,
  },
  {
    id: "castle_tower",
    name: "Castle Tower",
    tier: "premium",
    size: "xlarge",
    minMRR: 50000,
    footprint: { width: 5, depth: 5 },
    description: "A majestic castle tower",
    emoji: "🏰",
    animated: false,
  },

  // ─── Special (milestone) ───────────────────────────
  {
    id: "rainbow",
    name: "Rainbow",
    tier: "special",
    size: "xlarge",
    minMRR: 5000,
    footprint: { width: 0, depth: 0 },
    description: "A rainbow arcing over your garden",
    emoji: "🌈",
    animated: true,
  },
  {
    id: "ambient_particles",
    name: "Fireflies",
    tier: "special",
    size: "small",
    minMRR: 500,
    footprint: { width: 0, depth: 0 },
    description: "Butterflies and fireflies floating around",
    emoji: "✨",
    animated: true,
  },
  {
    id: "telescope",
    name: "Telescope",
    tier: "special",
    size: "medium",
    minMRR: 50000,
    footprint: { width: 2, depth: 2 },
    description: "Looking at the stars and the future",
    emoji: "🔭",
    animated: true,
  },
];

/** Get a decoration definition by ID */
export function getDecorationById(id: string): DecorationDefinition | undefined {
  return DECORATION_CATALOG.find((d) => d.id === id);
}

/** Get all decorations unlocked at a given MRR */
export function getUnlockedDecorations(mrr: number): DecorationDefinition[] {
  return DECORATION_CATALOG.filter((d) => mrr >= d.minMRR);
}

/** Get decorations for a specific tier */
export function getDecorationsByTier(tier: DecorationTier): DecorationDefinition[] {
  return DECORATION_CATALOG.filter((d) => d.tier === tier);
}
