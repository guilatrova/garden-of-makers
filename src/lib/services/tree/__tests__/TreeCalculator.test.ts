/**
 * TreeCalculator Unit Tests
 * Tests for tier calculation and fruit breakdown
 * Minimum 15 tests as per PROJECT.md requirements
 */

import { describe, it, expect } from "vitest";
import {
  getTier,
  getFruitBreakdown,
  getTierConfig,
  calculateTotalCustomers,
} from "../TreeCalculator";
import { TIER_CONFIGS } from "@/lib/constants/tiers";
import type { TreeTier } from "../types";

describe("getTier", () => {
  // Test 1: Seed tier (0 MRR)
  it("should return 'seed' for 0 cents MRR", () => {
    expect(getTier(0)).toBe("seed");
  });

  // Test 2: Sprout tier - minimum
  it("should return 'sprout' for $0.01 (1 cent) MRR", () => {
    expect(getTier(1)).toBe("sprout");
  });

  // Test 3: Sprout tier - maximum
  it("should return 'sprout' for $100 (10000 cents) MRR", () => {
    expect(getTier(10000)).toBe("sprout");
  });

  // Test 4: Shrub tier - minimum
  it("should return 'shrub' for $100.01 (10001 cents) MRR", () => {
    expect(getTier(10001)).toBe("shrub");
  });

  // Test 5: Shrub tier - maximum
  it("should return 'shrub' for $1000 (100000 cents) MRR", () => {
    expect(getTier(100000)).toBe("shrub");
  });

  // Test 6: Young tier - minimum
  it("should return 'young' for $1000.01 (100001 cents) MRR", () => {
    expect(getTier(100001)).toBe("young");
  });

  // Test 7: Young tier - maximum
  it("should return 'young' for $5000 (500000 cents) MRR", () => {
    expect(getTier(500000)).toBe("young");
  });

  // Test 8: Mature tier - minimum
  it("should return 'mature' for $5000.01 (500001 cents) MRR", () => {
    expect(getTier(500001)).toBe("mature");
  });

  // Test 9: Mature tier - maximum
  it("should return 'mature' for $25000 (2500000 cents) MRR", () => {
    expect(getTier(2500000)).toBe("mature");
  });

  // Test 10: Great tier - minimum
  it("should return 'great' for $25000.01 (2500001 cents) MRR", () => {
    expect(getTier(2500001)).toBe("great");
  });

  // Test 11: Great tier - maximum
  it("should return 'great' for $100000 (10000000 cents) MRR", () => {
    expect(getTier(10000000)).toBe("great");
  });

  // Test 12: Ancient tier - minimum
  it("should return 'ancient' for $100000.01 (10000001 cents) MRR", () => {
    expect(getTier(10000001)).toBe("ancient");
  });

  // Test 13: Ancient tier - maximum
  it("should return 'ancient' for $500000 (50000000 cents) MRR", () => {
    expect(getTier(50000000)).toBe("ancient");
  });

  // Test 14: World tier - minimum
  it("should return 'world' for $500000.01 (50000001 cents) MRR", () => {
    expect(getTier(50000001)).toBe("world");
  });

  // Test 15: World tier - large value
  it("should return 'world' for $1M+ (100000000 cents) MRR", () => {
    expect(getTier(100000000)).toBe("world");
  });
});

describe("getFruitBreakdown", () => {
  // Test 16: Zero customers
  it("should return all zeros for 0 customers", () => {
    const result = getFruitBreakdown(0);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    });
  });

  // Test 17: Single customer (1 blueberry)
  it("should return 1 blueberry for 1 customer", () => {
    const result = getFruitBreakdown(1);
    expect(result.blueberries).toBe(1);
    expect(result.apples).toBe(0);
    expect(result.oranges).toBe(0);
    expect(result.watermelons).toBe(0);
  });

  // Test 18: 10 customers (1 apple)
  it("should return 1 apple for 10 customers", () => {
    const result = getFruitBreakdown(10);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 0,
      apples: 1,
      blueberries: 0,
    });
  });

  // Test 19: 100 customers (1 orange)
  it("should return 1 orange for 100 customers", () => {
    const result = getFruitBreakdown(100);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 1,
      apples: 0,
      blueberries: 0,
    });
  });

  // Test 20: 999 customers (max before watermelon)
  it("should return 9 oranges, 9 apples, 9 blueberries for 999 customers", () => {
    const result = getFruitBreakdown(999);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 9,
      apples: 9,
      blueberries: 9,
    });
  });

  // Test 21: 1000 customers (1 watermelon)
  it("should return 1 watermelon for 1000 customers", () => {
    const result = getFruitBreakdown(1000);
    expect(result).toEqual({
      watermelons: 1,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    });
  });

  // Test 22: 3524 customers (complex breakdown from spec)
  it("should correctly break down 3524 customers", () => {
    const result = getFruitBreakdown(3524);
    expect(result).toEqual({
      watermelons: 3, // 3000
      oranges: 5, // 500
      apples: 2, // 20
      blueberries: 4, // 4
    });
  });

  // Test 23: Verify total customers calculation
  it("calculateTotalCustomers should correctly sum breakdown", () => {
    const testCases = [0, 1, 10, 100, 999, 1000, 3524, 10000];
    testCases.forEach((customers) => {
      const breakdown = getFruitBreakdown(customers);
      const total = calculateTotalCustomers(breakdown);
      expect(total).toBe(customers);
    });
  });

  // Test 24: Negative customers should return zeros
  it("should return all zeros for negative customers", () => {
    const result = getFruitBreakdown(-5);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    });
  });

  // Test 25: Large customer count
  it("should handle large customer counts correctly", () => {
    const result = getFruitBreakdown(12345);
    expect(result.watermelons).toBe(12); // 12000
    expect(result.oranges).toBe(3); // 300
    expect(result.apples).toBe(4); // 40
    expect(result.blueberries).toBe(5); // 5
  });
});

describe("getTierConfig", () => {
  // Test 26: Each tier has a valid config
  it("should return config for all valid tiers", () => {
    const tiers = ["seed", "sprout", "shrub", "young", "mature", "great", "ancient", "world"] as const;
    tiers.forEach((tier) => {
      const config = getTierConfig(tier);
      expect(config).toBeDefined();
      expect(config.tier).toBe(tier);
    });
  });

  // Test 27: Invalid tier should throw
  it("should throw error for invalid tier", () => {
    expect(() => getTierConfig("invalid" as unknown as TreeTier)).toThrow("Unknown tree tier: invalid");
  });

  // Test 28: Tier configs match TIER_CONFIGS array
  it("getTierConfig should return same data as TIER_CONFIGS", () => {
    TIER_CONFIGS.forEach((config) => {
      const fromGetter = getTierConfig(config.tier);
      expect(fromGetter).toEqual(config);
    });
  });
});
