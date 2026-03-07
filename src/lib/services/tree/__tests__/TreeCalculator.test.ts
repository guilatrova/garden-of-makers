/**
 * TreeCalculator Unit Tests
 * Tests for tier calculation and fruit breakdown
 * All monetary values are in dollars (matching TrustMRR API format)
 */

import { describe, it, expect } from "vitest";
import {
  getTier,
  getEffectiveMRR,
  getFruitBreakdown,
  getTierConfig,
  calculateTotalCustomers,
} from "../TreeCalculator";
import { TIER_CONFIGS } from "@/lib/constants/tiers";
import type { TreeTier } from "../types";

describe("getEffectiveMRR", () => {
  it("should return MRR when MRR is greater than 0", () => {
    expect(getEffectiveMRR(100, 50)).toBe(100);
    expect(getEffectiveMRR(50000, 0)).toBe(50000);
    expect(getEffectiveMRR(1, 9999)).toBe(1);
  });

  it("should return revenueLast30Days when MRR is 0", () => {
    expect(getEffectiveMRR(0, 50)).toBe(50);
    expect(getEffectiveMRR(0, 10000)).toBe(10000);
  });

  it("should return 0 when both MRR and revenueLast30Days are 0", () => {
    expect(getEffectiveMRR(0, 0)).toBe(0);
  });

  // Gumroad scenario - $7.1M revenue, $0 MRR
  it("should return 30-day revenue for Gumroad-like scenario (MRR=0, revenue=$7.1M)", () => {
    const gumroadRevenue = 7100000; // $7.1M
    expect(getEffectiveMRR(0, gumroadRevenue)).toBe(gumroadRevenue);
  });
});

describe("getTier", () => {
  // Seed tier (0 MRR)
  it("should return 'seed' for $0 MRR", () => {
    expect(getTier(0)).toBe("seed");
  });

  // Sprout tier: $1 - $100
  it("should return 'sprout' for $1 MRR", () => {
    expect(getTier(1)).toBe("sprout");
  });

  it("should return 'sprout' for $100 MRR", () => {
    expect(getTier(100)).toBe("sprout");
  });

  // Shrub tier: $101 - $1,000
  it("should return 'shrub' for $101 MRR", () => {
    expect(getTier(101)).toBe("shrub");
  });

  it("should return 'shrub' for $1,000 MRR", () => {
    expect(getTier(1000)).toBe("shrub");
  });

  // Young tier: $1,001 - $5,000
  it("should return 'young' for $1,001 MRR", () => {
    expect(getTier(1001)).toBe("young");
  });

  it("should return 'young' for $5,000 MRR", () => {
    expect(getTier(5000)).toBe("young");
  });

  // Mature tier: $5,001 - $25,000
  it("should return 'mature' for $5,001 MRR", () => {
    expect(getTier(5001)).toBe("mature");
  });

  it("should return 'mature' for $25,000 MRR", () => {
    expect(getTier(25000)).toBe("mature");
  });

  // Great tier: $25,001 - $100,000
  it("should return 'great' for $25,001 MRR", () => {
    expect(getTier(25001)).toBe("great");
  });

  it("should return 'great' for $100,000 MRR", () => {
    expect(getTier(100000)).toBe("great");
  });

  // Ancient tier: $100,001 - $500,000
  it("should return 'ancient' for $100,001 MRR", () => {
    expect(getTier(100001)).toBe("ancient");
  });

  it("should return 'ancient' for $500,000 MRR", () => {
    expect(getTier(500000)).toBe("ancient");
  });

  // World tier: $500,001+
  it("should return 'world' for $500,001 MRR", () => {
    expect(getTier(500001)).toBe("world");
  });

  it("should return 'world' for $1M+ MRR", () => {
    expect(getTier(1000000)).toBe("world");
  });

  // Fallback to 30-day revenue
  it("should NOT return 'seed' when MRR=0 but 30-day revenue > 0", () => {
    expect(getTier(0, 50)).not.toBe("seed");
    expect(getTier(0, 1000)).not.toBe("seed");
  });

  // Gumroad scenario - $7.1M revenue, $0 MRR should be 'world' tier
  it("should return 'world' for Gumroad-like scenario (MRR=0, revenue=$7.1M)", () => {
    expect(getTier(0, 7100000)).toBe("world");
  });

  it("should return 'shrub' when MRR=0 but revenue=$500", () => {
    expect(getTier(0, 500)).toBe("shrub");
  });

  it("should return 'young' when MRR=0 but revenue=$5k", () => {
    expect(getTier(0, 5000)).toBe("young");
  });

  // Real API examples
  it("should return 'mature' for TrustMRR (MRR=$15,088)", () => {
    expect(getTier(15088)).toBe("mature");
  });

  it("should return 'shrub' for EasyClaw (MRR=$894)", () => {
    expect(getTier(894)).toBe("shrub");
  });

  it("should return 'world' for Stan (MRR=$3.5M)", () => {
    expect(getTier(3501731)).toBe("world");
  });

  // MRR takes precedence over revenue
  it("should use MRR when both MRR and revenue are provided", () => {
    // MRR says sprout ($50), revenue says great ($75k) - should use MRR
    expect(getTier(50, 75000)).toBe("sprout");
    // MRR says world ($1M), revenue says seed ($0) - should use MRR
    expect(getTier(1000000, 0)).toBe("world");
  });
});

describe("getFruitBreakdown", () => {
  it("should return all zeros for 0 customers", () => {
    const result = getFruitBreakdown(0);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    });
  });

  it("should return 1 blueberry for 1 customer", () => {
    const result = getFruitBreakdown(1);
    expect(result.blueberries).toBe(1);
    expect(result.apples).toBe(0);
    expect(result.oranges).toBe(0);
    expect(result.watermelons).toBe(0);
  });

  it("should return 1 apple for 10 customers", () => {
    const result = getFruitBreakdown(10);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 0,
      apples: 1,
      blueberries: 0,
    });
  });

  it("should return 1 orange for 100 customers", () => {
    const result = getFruitBreakdown(100);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 1,
      apples: 0,
      blueberries: 0,
    });
  });

  it("should return 9 oranges, 9 apples, 9 blueberries for 999 customers", () => {
    const result = getFruitBreakdown(999);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 9,
      apples: 9,
      blueberries: 9,
    });
  });

  it("should return 1 watermelon for 1000 customers", () => {
    const result = getFruitBreakdown(1000);
    expect(result).toEqual({
      watermelons: 1,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    });
  });

  it("should correctly break down 3524 customers", () => {
    const result = getFruitBreakdown(3524);
    expect(result).toEqual({
      watermelons: 3,
      oranges: 5,
      apples: 2,
      blueberries: 4,
    });
  });

  it("calculateTotalCustomers should correctly sum breakdown", () => {
    const testCases = [0, 1, 10, 100, 999, 1000, 3524, 10000];
    testCases.forEach((customers) => {
      const breakdown = getFruitBreakdown(customers);
      const total = calculateTotalCustomers(breakdown);
      expect(total).toBe(customers);
    });
  });

  it("should return all zeros for negative customers", () => {
    const result = getFruitBreakdown(-5);
    expect(result).toEqual({
      watermelons: 0,
      oranges: 0,
      apples: 0,
      blueberries: 0,
    });
  });

  it("should handle large customer counts correctly", () => {
    const result = getFruitBreakdown(12345);
    expect(result.watermelons).toBe(12);
    expect(result.oranges).toBe(3);
    expect(result.apples).toBe(4);
    expect(result.blueberries).toBe(5);
  });
});

describe("getTierConfig", () => {
  it("should return config for all valid tiers", () => {
    const tiers = ["seed", "sprout", "shrub", "young", "mature", "great", "ancient", "world"] as const;
    tiers.forEach((tier) => {
      const config = getTierConfig(tier);
      expect(config).toBeDefined();
      expect(config.tier).toBe(tier);
    });
  });

  it("should throw error for invalid tier", () => {
    expect(() => getTierConfig("invalid" as unknown as TreeTier)).toThrow("Unknown tree tier: invalid");
  });

  it("getTierConfig should return same data as TIER_CONFIGS", () => {
    TIER_CONFIGS.forEach((config) => {
      const fromGetter = getTierConfig(config.tier);
      expect(fromGetter).toEqual(config);
    });
  });
});
