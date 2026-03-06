/**
 * Fruit type definitions
 * Based on PROJECT.md specification
 * 
 * Each fruit type represents a different customer count value
 */

export interface FruitDefinition {
  type: "blueberry" | "apple" | "orange" | "watermelon";
  value: number; // Number of customers this fruit represents
  emoji: string;
  size: "tiny" | "small" | "medium" | "large" | "huge";
  color: string;
}

/**
 * Fruit values - how many customers each fruit represents
 */
export const FRUIT_VALUES = {
  blueberry: 1,
  apple: 10,
  orange: 100,
  watermelon: 1000,
} as const;

/**
 * Fruit definitions with visual properties
 */
export const FRUIT_DEFINITIONS: FruitDefinition[] = [
  {
    type: "blueberry",
    value: 1,
    emoji: "🫐",
    size: "tiny",
    color: "#4B0082", // Indigo/blue-purple
  },
  {
    type: "apple",
    value: 10,
    emoji: "🍎",
    size: "small",
    color: "#DC143C", // Crimson
  },
  {
    type: "orange",
    value: 100,
    emoji: "🍊",
    size: "medium",
    color: "#FF8C00", // Dark orange
  },
  {
    type: "watermelon",
    value: 1000,
    emoji: "🍉",
    size: "huge",
    color: "#FF6B6B", // Watermelon pink
  },
];

/**
 * Get fruit definition by type
 */
export function getFruitDefinition(type: keyof typeof FRUIT_VALUES): FruitDefinition | undefined {
  return FRUIT_DEFINITIONS.find((f) => f.type === type);
}

/**
 * Size multipliers for 3D rendering (relative to base size)
 */
export const FRUIT_SIZE_MULTIPLIERS = {
  tiny: 0.05,
  small: 0.1,
  medium: 0.2,
  large: 0.35,
  huge: 0.6,
} as const;
