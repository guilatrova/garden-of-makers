/**
 * Category to Biome Zone mapping
 * Based on PROJECT.md specification
 * 
 * Maps TrustMRR categories to forest biome zones for UI filtering
 */

export type BiomeZone =
  | "northeast" // AI
  | "central" // SaaS
  | "east" // Developer Tools
  | "south" // Ecommerce
  | "northwest" // Fintech
  | "west" // Health
  | "southeast" // Education
  | "southwest" // Other/Uncategorized
  | "center"; // High MRR trees (ancient + world)

export interface CategoryMapping {
  category: string;
  zone: BiomeZone;
  displayName: string;
  color: string; // Zone tint color
}

/**
 * TrustMRR category to biome zone mappings
 */
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  { category: "ai", zone: "northeast", displayName: "AI", color: "#9C27B0" },
  { category: "saas", zone: "central", displayName: "SaaS", color: "#2196F3" },
  {
    category: "developer-tools",
    zone: "east",
    displayName: "Developer Tools",
    color: "#4CAF50",
  },
  {
    category: "ecommerce",
    zone: "south",
    displayName: "E-commerce",
    color: "#FF9800",
  },
  {
    category: "fintech",
    zone: "northwest",
    displayName: "Fintech",
    color: "#00BCD4",
  },
  {
    category: "health",
    zone: "west",
    displayName: "Health",
    color: "#E91E63",
  },
  {
    category: "education",
    zone: "southeast",
    displayName: "Education",
    color: "#8BC34A",
  },
];

/**
 * Get biome zone for a category
 */
export function getZoneForCategory(category: string | null): BiomeZone {
  if (!category) return "southwest";
  const mapping = CATEGORY_MAPPINGS.find(
    (m) => m.category.toLowerCase() === category.toLowerCase()
  );
  return mapping?.zone ?? "southwest";
}

/**
 * Get display name for a category
 */
export function getCategoryDisplayName(category: string | null): string {
  if (!category) return "Other";
  const mapping = CATEGORY_MAPPINGS.find(
    (m) => m.category.toLowerCase() === category.toLowerCase()
  );
  return mapping?.displayName ?? category;
}

/**
 * Get zone color for a category
 */
export function getCategoryColor(category: string | null): string {
  if (!category) return "#9E9E9E";
  const mapping = CATEGORY_MAPPINGS.find(
    (m) => m.category.toLowerCase() === category.toLowerCase()
  );
  return mapping?.color ?? "#9E9E9E";
}
