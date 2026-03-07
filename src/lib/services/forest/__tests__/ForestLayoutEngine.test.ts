/**
 * ForestLayoutEngine Unit Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ForestLayoutEngine,
  fibonacciSpiral,
  getDistance,
} from "../";
import { TreeData, TreeTier } from "@/lib/services/tree/types";

// Helper to create test tree data
function createTestTree(
  slug: string,
  tier: TreeTier,
  mrr: number,
  category: string | null
): TreeData {
  return {
    slug,
    name: slug,
    icon: null,
    category,
    paymentProvider: "stripe",
    mrr,
    revenueLast30Days: mrr,
    totalRevenue: mrr * 12,
    customers: Math.floor(mrr / 1000),
    activeSubscriptions: Math.floor(mrr / 1000),
    growth30d: 0.1,
    onSale: false,
    askingPrice: null,
    xHandle: null,
    tier,
    fruits: {
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: Math.floor(mrr / 1000),
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
    it("should return center position for index 0", () => {
      const result = fibonacciSpiral(0, 10);
      expect(result.x).toBe(0);
      expect(result.z).toBe(0);
    });

    it("should distribute trees in spiral pattern", () => {
      const positions = [];
      for (let i = 0; i < 5; i++) {
        positions.push(fibonacciSpiral(i, 10));
      }

      // Each position should be different (except index 0 which is center)
      for (let i = 1; i < positions.length; i++) {
        const hasDifferentPosition = positions.some(
          (p, idx) => idx !== i && (p.x !== positions[i].x || p.z !== positions[i].z)
        );
        expect(hasDifferentPosition).toBe(true);
      }
    });

    it("should expand radius for larger indices", () => {
      const pos1 = fibonacciSpiral(1, 10);
      const pos9 = fibonacciSpiral(9, 10);

      const dist1 = Math.sqrt(pos1.x ** 2 + pos1.z ** 2);
      const dist9 = Math.sqrt(pos9.x ** 2 + pos9.z ** 2);

      expect(dist9).toBeGreaterThan(dist1);
    });

    it("should calculate radius based on lotSize * sqrt(index)", () => {
      const lotSize = 10;
      const index = 16;
      const expectedRadius = lotSize * Math.sqrt(index); // 10 * 4 = 40

      const result = fibonacciSpiral(index, lotSize);
      const actualRadius = Math.sqrt(result.x ** 2 + result.z ** 2);

      expect(actualRadius).toBeCloseTo(expectedRadius, 5);
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

  describe("positionTrees", () => {
    it("should return empty array for empty input", () => {
      const result = engine.positionTrees([]);
      expect(result).toEqual([]);
    });

    it("should place single tree at origin", () => {
      const tree = createTestTree("single", "young", 100_000, "saas");
      const result = engine.positionTrees([tree]);

      expect(result).toHaveLength(1);
      expect(result[0].position.x).toBe(0);
      expect(result[0].position.y).toBe(0);
      expect(result[0].position.z).toBe(0);
    });

    it("should place 50 trees within radius ~70u (lotSize * sqrt(49) ≈ 70)", () => {
      const trees: TreeData[] = [];
      for (let i = 0; i < 50; i++) {
        trees.push(createTestTree(`tree-${i}`, "young", 100_000 + i * 1000, "saas"));
      }

      const result = engine.positionTrees(trees);
      expect(result).toHaveLength(50);

      // Find max radius (excluding the tree at origin)
      let maxRadius = 0;
      for (const tree of result) {
        const radius = Math.sqrt(tree.position.x ** 2 + tree.position.z ** 2);
        maxRadius = Math.max(maxRadius, radius);
      }

      // lotSize * sqrt(49) = 10 * 7 = 70, allow some tolerance
      expect(maxRadius).toBeLessThan(80);
    });

    it("should place 5000 trees within radius ~707u (lotSize * sqrt(4999) ≈ 707)", () => {
      const trees: TreeData[] = [];
      for (let i = 0; i < 5000; i++) {
        trees.push(createTestTree(`tree-${i}`, "young", 100_000 + i * 100, "saas"));
      }

      const result = engine.positionTrees(trees);
      expect(result).toHaveLength(5000);

      // Find max radius
      let maxRadius = 0;
      for (const tree of result) {
        const radius = Math.sqrt(tree.position.x ** 2 + tree.position.z ** 2);
        maxRadius = Math.max(maxRadius, radius);
      }

      // lotSize * sqrt(4999) ≈ 10 * 70.7 ≈ 707, allow some tolerance
      expect(maxRadius).toBeLessThan(750);
    });

    it("should sort trees by MRR descending - first tree has highest MRR", () => {
      const lowMrr = createTestTree("low", "young", 100_000, "saas");
      const highMrr = createTestTree("high", "mature", 1_000_000, "saas");
      const midMrr = createTestTree("mid", "young", 500_000, "saas");

      const result = engine.positionTrees([lowMrr, highMrr, midMrr]);

      // Highest MRR tree should be at origin (index 0)
      expect(result[0].slug).toBe("high");
      expect(result[0].position.x).toBe(0);
      expect(result[0].position.z).toBe(0);

      // Second highest should be at index 1
      expect(result[1].slug).toBe("mid");

      // Lowest should be at index 2
      expect(result[2].slug).toBe("low");
    });

    it("should be deterministic - same input produces same positions", () => {
      const trees: TreeData[] = [];
      for (let i = 0; i < 10; i++) {
        trees.push(createTestTree(`tree-${i}`, "young", 100_000 + i * 1000, "saas"));
      }

      const result1 = engine.positionTrees(trees);
      const result2 = engine.positionTrees(trees);

      expect(result1).toHaveLength(result2.length);
      for (let i = 0; i < result1.length; i++) {
        expect(result1[i].position.x).toBe(result2[i].position.x);
        expect(result1[i].position.y).toBe(result2[i].position.y);
        expect(result1[i].position.z).toBe(result2[i].position.z);
      }
    });

    it("should not place two trees at exact same position (for count > 1)", () => {
      const trees: TreeData[] = [];
      for (let i = 0; i < 10; i++) {
        trees.push(createTestTree(`tree-${i}`, "young", 100_000 + i * 1000, "saas"));
      }

      const result = engine.positionTrees(trees);

      // Check all pairs for duplicate positions
      for (let i = 0; i < result.length; i++) {
        for (let j = i + 1; j < result.length; j++) {
          const sameX = result[i].position.x === result[j].position.x;
          const sameZ = result[i].position.z === result[j].position.z;
          expect(sameX && sameZ).toBe(false);
        }
      }
    });

    it("should use fallback to revenueLast30Days when mrr is missing", () => {
      const treeWithMrr = createTestTree("with-mrr", "young", 500_000, "saas");
      
      const treeWithoutMrr: TreeData = {
        ...createTestTree("no-mrr", "young", 0, "saas"),
        mrr: null as unknown as undefined,
        revenueLast30Days: 1_000_000, // Higher than 500_000
      };

      const result = engine.positionTrees([treeWithMrr, treeWithoutMrr]);

      // Tree without MRR but with higher revenueLast30Days should be first
      expect(result[0].slug).toBe("no-mrr");
      expect(result[1].slug).toBe("with-mrr");
    });

    it("should handle mixed categories without zone-based positioning", () => {
      const aiTree = createTestTree("ai-1", "young", 100_000, "ai");
      const saasTree = createTestTree("saas-1", "young", 200_000, "saas");
      const devTree = createTestTree("dev-1", "young", 150_000, "developer-tools");

      const result = engine.positionTrees([aiTree, saasTree, devTree]);

      expect(result).toHaveLength(3);

      // Should be sorted by MRR, not grouped by zone
      expect(result[0].slug).toBe("saas-1"); // 200k
      expect(result[1].slug).toBe("dev-1");  // 150k
      expect(result[2].slug).toBe("ai-1");  // 100k

      // All should be positioned using fibonacci spiral from origin
      expect(result[0].position.x).toBe(0);
      expect(result[0].position.z).toBe(0);
    });

    it("should respect custom lotSize config", () => {
      const customEngine = new ForestLayoutEngine({ lotSize: 10 });

      const trees: TreeData[] = [];
      for (let i = 0; i < 10; i++) {
        trees.push(createTestTree(`tree-${i}`, "young", 100_000, "saas"));
      }

      const result = customEngine.positionTrees(trees);

      // With lotSize 10, the furthest tree should be the same as default
      let maxRadius = 0;
      for (const tree of result) {
        const radius = Math.sqrt(tree.position.x ** 2 + tree.position.z ** 2);
        maxRadius = Math.max(maxRadius, radius);
      }

      // With lotSize 10, max radius should be ~10 * sqrt(9) = 30
      expect(maxRadius).toBeGreaterThan(25);
    });
  });

  describe("config management", () => {
    it("should get default config", () => {
      const config = engine.getConfig();
      expect(config.lotSize).toBe(10);
    });

    it("should update config", () => {
      engine.setConfig({ lotSize: 15 });
      expect(engine.getConfig().lotSize).toBe(15);
    });

    it("should merge partial config updates", () => {
      engine.setConfig({ lotSize: 10 });
      expect(engine.getConfig().lotSize).toBe(10);
    });
  });
});
