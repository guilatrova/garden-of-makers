/**
 * MakerGardenService Unit Tests
 * Tests the pure logic functions of the garden service
 */

import { describe, it, expect } from "vitest";
import {
  calculateGardenSize,
  calculateTotalMRR,
  calculateTotalCustomers,
  extractMakerInfo,
} from "../types";
import { TreeData } from "@/lib/services/tree/types";

describe("calculateGardenSize", () => {
  it("returns 'small' for 1-2 products", () => {
    expect(calculateGardenSize(1)).toBe("small");
    expect(calculateGardenSize(2)).toBe("small");
  });

  it("returns 'medium' for 3-5 products", () => {
    expect(calculateGardenSize(3)).toBe("medium");
    expect(calculateGardenSize(4)).toBe("medium");
    expect(calculateGardenSize(5)).toBe("medium");
  });

  it("returns 'large' for 6-10 products", () => {
    expect(calculateGardenSize(6)).toBe("large");
    expect(calculateGardenSize(8)).toBe("large");
    expect(calculateGardenSize(10)).toBe("large");
  });

  it("returns 'estate' for 11+ products", () => {
    expect(calculateGardenSize(11)).toBe("estate");
    expect(calculateGardenSize(20)).toBe("estate");
    expect(calculateGardenSize(100)).toBe("estate");
  });

  it("handles edge case of 0 products", () => {
    expect(calculateGardenSize(0)).toBe("small");
  });
});

describe("calculateTotalMRR", () => {
  it("returns 0 for empty products array", () => {
    expect(calculateTotalMRR([])).toBe(0);
  });

  it("calculates total MRR for single product", () => {
    const products: TreeData[] = [
      createMockTreeData({ mrrCents: 50000 }),
    ];
    expect(calculateTotalMRR(products)).toBe(50000);
  });

  it("calculates total MRR for multiple products", () => {
    const products: TreeData[] = [
      createMockTreeData({ mrrCents: 50000 }),
      createMockTreeData({ mrrCents: 100000 }),
      createMockTreeData({ mrrCents: 25000 }),
    ];
    expect(calculateTotalMRR(products)).toBe(175000);
  });

  it("handles products with 0 MRR", () => {
    const products: TreeData[] = [
      createMockTreeData({ mrrCents: 0 }),
      createMockTreeData({ mrrCents: 100000 }),
    ];
    expect(calculateTotalMRR(products)).toBe(100000);
  });
});

describe("calculateTotalCustomers", () => {
  it("returns 0 for empty products array", () => {
    expect(calculateTotalCustomers([])).toBe(0);
  });

  it("calculates total customers for single product", () => {
    const products: TreeData[] = [
      createMockTreeData({ customers: 100 }),
    ];
    expect(calculateTotalCustomers(products)).toBe(100);
  });

  it("calculates total customers for multiple products", () => {
    const products: TreeData[] = [
      createMockTreeData({ customers: 100 }),
      createMockTreeData({ customers: 250 }),
      createMockTreeData({ customers: 50 }),
    ];
    expect(calculateTotalCustomers(products)).toBe(400);
  });

  it("handles products with 0 customers", () => {
    const products: TreeData[] = [
      createMockTreeData({ customers: 0 }),
      createMockTreeData({ customers: 500 }),
    ];
    expect(calculateTotalCustomers(products)).toBe(500);
  });
});

describe("extractMakerInfo", () => {
  it("extracts xName when handle matches", () => {
    const cofounders = [
      { xHandle: "@john_doe", xName: "John Doe" },
      { xHandle: "@jane_doe", xName: "Jane Doe" },
    ];
    const result = extractMakerInfo("@john_doe", cofounders);
    expect(result.xName).toBe("John Doe");
  });

  it("extracts xName without @ prefix in search", () => {
    const cofounders = [
      { xHandle: "@john_doe", xName: "John Doe" },
    ];
    const result = extractMakerInfo("john_doe", cofounders);
    expect(result.xName).toBe("John Doe");
  });

  it("extracts xName when cofounder handle has no @", () => {
    const cofounders = [
      { xHandle: "john_doe", xName: "John Doe" },
    ];
    const result = extractMakerInfo("@john_doe", cofounders);
    expect(result.xName).toBe("John Doe");
  });

  it("returns null xName when handle not found", () => {
    const cofounders = [
      { xHandle: "@jane_doe", xName: "Jane Doe" },
    ];
    const result = extractMakerInfo("@john_doe", cofounders);
    expect(result.xName).toBeNull();
  });

  it("returns null xName when cofounders array is empty", () => {
    const result = extractMakerInfo("@john_doe", []);
    expect(result.xName).toBeNull();
  });

  it("handles case-insensitive matching", () => {
    const cofounders = [
      { xHandle: "@John_Doe", xName: "John Doe" },
    ];
    const result = extractMakerInfo("@john_doe", cofounders);
    expect(result.xName).toBe("John Doe");
  });

  it("handles null xName in cofounder data", () => {
    const cofounders = [
      { xHandle: "@john_doe", xName: null },
    ];
    const result = extractMakerInfo("@john_doe", cofounders);
    expect(result.xName).toBeNull();
  });
});

// Helper function to create mock TreeData for tests
function createMockTreeData(overrides: Partial<TreeData> = {}): TreeData {
  return {
    slug: "test-startup",
    name: "Test Startup",
    icon: null,
    category: "saas",
    paymentProvider: "stripe",
    mrrCents: 50000,
    revenueLast30DaysCents: 50000,
    totalRevenueCents: 500000,
    customers: 100,
    activeSubscriptions: 100,
    growth30d: 0.1,
    onSale: false,
    askingPriceCents: null,
    xHandle: "@founder",
    tier: "mature",
    fruits: {
      watermelons: 0,
      oranges: 0,
      apples: 10,
      blueberries: 0,
    },
    position: { x: 0, y: 0, z: 0 },
    ...overrides,
  };
}
