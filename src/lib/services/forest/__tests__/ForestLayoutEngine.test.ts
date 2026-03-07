/**
 * ForestLayoutEngine Unit Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ForestLayoutEngine,
  fibonacciSpiral,
  getDistance,
  getTreeCanopyRadius,
  hasPositionConflict,
  isSpecialTree,
  findValidPosition,
  DEFAULT_LAYOUT_CONFIG,
} from "../";
import { TreeData, TreeTier } from "@/lib/services/tree/types";
import { ZONE_CENTERS } from "@/lib/constants/categories";

// Helper to create test tree data
function createTestTree(
  slug: string,
  tier: TreeTier,
  mrrCents: number,
  category: string | null
): TreeData {
  return {
    slug,
    name: slug,
    icon: null,
    category,
    paymentProvider: "stripe",
    mrrCents,
    revenueLast30DaysCents: mrrCents,
    totalRevenueCents: mrrCents * 12,
    customers: Math.floor(mrrCents / 1000),
    activeSubscriptions: Math.floor(mrrCents / 1000),
    growth30d: 0.1,
    onSale: false,
    askingPriceCents: null,
    xHandle: null,
    tier,
    fruits: {
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: Math.floor(mrrCents / 1000),
    },
    position: { x: 0, y: 0, z: 0 },
  };
}

describe("ForestLayoutEngine", () => {
  let engine: ForestLayoutEngine;

  beforeEach(() => {
    engine = new ForestLayoutEngine();
  });

  describe("fibonacciSpiral", () => {
    it("should return center position for single tree", () => {
      const result = fibonacciSpiral(0, 1, 80);
      expect(result.x).toBe(0);
      expect(result.z).toBe(0);
    });

    it("should distribute trees in spiral pattern", () => {
      const positions = [];
      for (let i = 0; i < 5; i++) {
        positions.push(fibonacciSpiral(i, 5, 80));
      }

      // Each position should be different
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i].x).not.toBe(positions[0].x);
        expect(positions[i].z).not.toBe(positions[0].z);
      }
    });

    it("should expand radius for larger indices", () => {
      const pos1 = fibonacciSpiral(1, 10, 80);
      const pos9 = fibonacciSpiral(9, 10, 80);

      const dist1 = Math.sqrt(pos1.x ** 2 + pos1.z ** 2);
      const dist9 = Math.sqrt(pos9.x ** 2 + pos9.z ** 2);

      expect(dist9).toBeGreaterThan(dist1);
    });
  });

  describe("getDistance", () => {
    it("should calculate distance between two positions", () => {
      const pos1 = { x: 0, y: 0, z: 0 };
      const pos2 = { x: 3, y: 0, z: 4 };

      expect(getDistance(pos1, pos2)).toBe(5);
    });

    it("should return 0 for same position", () => {
      const pos = { x: 10, y: 0, z: 20 };
      expect(getDistance(pos, pos)).toBe(0);
    });
  });

  describe("getTreeCanopyRadius", () => {
    it("should return correct radius for seed tier", () => {
      const tree = createTestTree("seed-tree", "seed", 0, "saas");
      expect(getTreeCanopyRadius(tree)).toBe(0.2);
    });

    it("should return correct radius for world tier", () => {
      const tree = createTestTree("world-tree", "world", 600_000_00, "saas");
      expect(getTreeCanopyRadius(tree)).toBe(8.0);
    });
  });

  describe("hasPositionConflict", () => {
    it("should return false when no trees exist", () => {
      const position = { x: 0, y: 0, z: 0 };
      const tree = createTestTree("test", "young", 100_000, "saas");

      expect(
        hasPositionConflict(
          position,
          [],
          getTreeCanopyRadius(tree),
          DEFAULT_LAYOUT_CONFIG
        )
      ).toBe(false);
    });

    it("should detect conflict when trees are too close", () => {
      const tree1 = {
        ...createTestTree("tree1", "young", 100_000, "saas"),
        position: { x: 0, y: 0, z: 0 },
      };
      const position = { x: 0.1, y: 0, z: 0 };

      expect(
        hasPositionConflict(
          position,
          [tree1],
          getTreeCanopyRadius(tree1),
          DEFAULT_LAYOUT_CONFIG
        )
      ).toBe(true);
    });

    it("should not detect conflict when trees are far apart", () => {
      const tree1 = {
        ...createTestTree("tree1", "young", 100_000, "saas"),
        position: { x: 0, y: 0, z: 0 },
      };
      const position = { x: 100, y: 0, z: 100 };

      expect(
        hasPositionConflict(
          position,
          [tree1],
          getTreeCanopyRadius(tree1),
          DEFAULT_LAYOUT_CONFIG
        )
      ).toBe(false);
    });
  });

  describe("isSpecialTree", () => {
    it("should return true for ancient tier", () => {
      expect(isSpecialTree("ancient")).toBe(true);
    });

    it("should return true for world tier", () => {
      expect(isSpecialTree("world")).toBe(true);
    });

    it("should return false for other tiers", () => {
      expect(isSpecialTree("seed")).toBe(false);
      expect(isSpecialTree("sprout")).toBe(false);
      expect(isSpecialTree("shrub")).toBe(false);
      expect(isSpecialTree("young")).toBe(false);
      expect(isSpecialTree("mature")).toBe(false);
      expect(isSpecialTree("great")).toBe(false);
    });
  });

  describe("findValidPosition", () => {
    it("should return a position", () => {
      const tree = createTestTree("test", "young", 100_000, "saas");
      const zoneCenter = { x: 0, z: 0 };

      const position = findValidPosition(
        tree,
        zoneCenter,
        0,
        1,
        [],
        DEFAULT_LAYOUT_CONFIG
      );

      expect(position.x).toBeDefined();
      expect(position.z).toBeDefined();
      expect(position.y).toBe(0);
    });
  });

  describe("positionTrees", () => {
    it("should return empty array for empty input", () => {
      const result = engine.positionTrees([]);
      expect(result).toEqual([]);
    });

    it("should place single tree near zone center", () => {
      const tree = createTestTree("single", "young", 100_000, "saas");
      const result = engine.positionTrees([tree]);

      expect(result).toHaveLength(1);
      // SaaS maps to central zone - tree should be near center (within zone radius)
      expect(Math.abs(result[0].position.x - ZONE_CENTERS.central.x)).toBeLessThan(10);
      expect(Math.abs(result[0].position.z - ZONE_CENTERS.central.z)).toBeLessThan(10);
    });

    it("should group trees by category into correct zones", () => {
      const aiTree = createTestTree("ai-1", "young", 100_000, "ai");
      const saasTree = createTestTree("saas-1", "young", 100_000, "saas");
      const devTree = createTestTree("dev-1", "young", 100_000, "developer-tools");

      const result = engine.positionTrees([aiTree, saasTree, devTree]);

      expect(result).toHaveLength(3);

      const aiResult = result.find((t) => t.slug === "ai-1");
      const saasResult = result.find((t) => t.slug === "saas-1");
      const devResult = result.find((t) => t.slug === "dev-1");

      // AI -> northeast, SaaS -> central, DevTools -> east
      // Trees should be near their zone centers (within zone radius)
      expect(Math.abs(aiResult!.position.x - ZONE_CENTERS.northeast.x)).toBeLessThan(10);
      expect(Math.abs(aiResult!.position.z - ZONE_CENTERS.northeast.z)).toBeLessThan(10);

      expect(Math.abs(saasResult!.position.x - ZONE_CENTERS.central.x)).toBeLessThan(10);
      expect(Math.abs(saasResult!.position.z - ZONE_CENTERS.central.z)).toBeLessThan(10);

      expect(Math.abs(devResult!.position.x - ZONE_CENTERS.east.x)).toBeLessThan(10);
      expect(Math.abs(devResult!.position.z - ZONE_CENTERS.east.z)).toBeLessThan(10);
    });

    it("should place ancient trees at world center regardless of category", () => {
      const ancientAI = createTestTree("ancient-ai", "ancient", 200_000_00, "ai");
      const ancientSaaS = createTestTree("ancient-saas", "ancient", 300_000_00, "saas");

      // Only test with ancient trees (no normal tree) to avoid spacing pushing them apart
      const result = engine.positionTrees([ancientAI, ancientSaaS]);

      const ancientAIResult = result.find((t) => t.slug === "ancient-ai");
      const ancientSaaSResult = result.find((t) => t.slug === "ancient-saas");

      // Ancient trees should be near center (within special tree area)
      // Note: spacing requirements may push them apart from exact center
      expect(Math.abs(ancientAIResult!.position.x - ZONE_CENTERS.center.x)).toBeLessThan(30);
      expect(Math.abs(ancientAIResult!.position.z - ZONE_CENTERS.center.z)).toBeLessThan(30);

      expect(Math.abs(ancientSaaSResult!.position.x - ZONE_CENTERS.center.x)).toBeLessThan(30);
      expect(Math.abs(ancientSaaSResult!.position.z - ZONE_CENTERS.center.z)).toBeLessThan(30);
    });

    it("should place world trees at world center regardless of category", () => {
      const worldTree = createTestTree("world-ai", "world", 600_000_00, "ai");
      const result = engine.positionTrees([worldTree]);

      // World trees should be near center (within special tree area)
      expect(Math.abs(result[0].position.x - ZONE_CENTERS.center.x)).toBeLessThan(15);
      expect(Math.abs(result[0].position.z - ZONE_CENTERS.center.z)).toBeLessThan(15);
    });

    it("should sort trees by MRR descending within zone", () => {
      const lowMrr = createTestTree("low", "young", 100_000, "saas");
      const highMrr = createTestTree("high", "mature", 1_000_000, "saas");
      const midMrr = createTestTree("mid", "young", 500_000, "saas");

      const result = engine.positionTrees([lowMrr, highMrr, midMrr]);

      // Higher MRR should be closer to center (lower index in fibonacci spiral)
      const highResult = result.find((t) => t.slug === "high");
      const midResult = result.find((t) => t.slug === "mid");
      const lowResult = result.find((t) => t.slug === "low");

      // Calculate distance from center
      const highDist = Math.sqrt(
        (highResult!.position.x - ZONE_CENTERS.central.x) ** 2 +
          (highResult!.position.z - ZONE_CENTERS.central.z) ** 2
      );
      const midDist = Math.sqrt(
        (midResult!.position.x - ZONE_CENTERS.central.x) ** 2 +
          (midResult!.position.z - ZONE_CENTERS.central.z) ** 2
      );
      const lowDist = Math.sqrt(
        (lowResult!.position.x - ZONE_CENTERS.central.x) ** 2 +
          (lowResult!.position.z - ZONE_CENTERS.central.z) ** 2
      );

      expect(highDist).toBeLessThanOrEqual(midDist);
      expect(midDist).toBeLessThanOrEqual(lowDist);
    });

    it("should ensure no two trees overlap", () => {
      const trees: TreeData[] = [];
      for (let i = 0; i < 10; i++) {
        trees.push(createTestTree(`tree-${i}`, "young", 100_000 + i * 1000, "saas"));
      }

      const result = engine.positionTrees(trees);

      // Check all pairs for overlap
      for (let i = 0; i < result.length; i++) {
        for (let j = i + 1; j < result.length; j++) {
          const tree1 = result[i];
          const tree2 = result[j];

          const distance = getDistance(tree1.position, tree2.position);
          const minDistance =
            Math.max(
              getTreeCanopyRadius(tree1),
              getTreeCanopyRadius(tree2)
            ) * DEFAULT_LAYOUT_CONFIG.spacingMultiplier;

          expect(distance).toBeGreaterThanOrEqual(minDistance * 0.9); // Allow 10% tolerance for jitter
        }
      }
    });

    it("should handle null category by placing in southwest zone", () => {
      const noCategoryTree = createTestTree("no-cat", "young", 100_000, null);
      const result = engine.positionTrees([noCategoryTree]);

      // Trees with null category should be near southwest zone center
      expect(Math.abs(result[0].position.x - ZONE_CENTERS.southwest.x)).toBeLessThan(10);
      expect(Math.abs(result[0].position.z - ZONE_CENTERS.southwest.z)).toBeLessThan(10);
    });

    it("should handle unknown category by placing in southwest zone", () => {
      const unknownCategoryTree = createTestTree("unknown-cat", "young", 100_000, "unknown-category");
      const result = engine.positionTrees([unknownCategoryTree]);

      // Trees with unknown category should be near southwest zone center
      expect(Math.abs(result[0].position.x - ZONE_CENTERS.southwest.x)).toBeLessThan(10);
      expect(Math.abs(result[0].position.z - ZONE_CENTERS.southwest.z)).toBeLessThan(10);
    });

    it("should respect custom config", () => {
      const customEngine = new ForestLayoutEngine({
        spacingMultiplier: 5,
        zoneRadius: 100,
      });

      const tree = createTestTree("test", "young", 100_000, "saas");
      const result = customEngine.positionTrees([tree]);

      expect(result).toHaveLength(1);
      expect(customEngine.getConfig().spacingMultiplier).toBe(5);
      expect(customEngine.getConfig().zoneRadius).toBe(100);
    });
  });

  describe("config management", () => {
    it("should get default config", () => {
      const config = engine.getConfig();
      expect(config.spacingMultiplier).toBe(2.5);
      expect(config.zoneRadius).toBe(80);
      expect(config.centerSpecialTrees).toBe(true);
    });

    it("should update config", () => {
      engine.setConfig({ spacingMultiplier: 3 });
      expect(engine.getConfig().spacingMultiplier).toBe(3);
    });

    it("should merge partial config updates", () => {
      engine.setConfig({ zoneRadius: 120 });
      expect(engine.getConfig().spacingMultiplier).toBe(2.5); // unchanged
      expect(engine.getConfig().zoneRadius).toBe(120);
    });
  });
});
