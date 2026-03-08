/**
 * Maker Garden Types
 * Domain types for maker's personal garden with all their products
 */

import { TreeData } from "@/lib/services/tree/types";
import { GardenPlot } from "./GardenLayoutEngine";

export type GardenSize = "small" | "medium" | "large" | "estate";

export interface MakerGarden {
  xHandle: string;
  xName: string | null;
  xFollowerCount: number | null;
  products: TreeData[];
  totalMRR: number;
  totalCustomers: number;
  totalProducts: number;
  gardenSize: GardenSize;
  plot: GardenPlot;
}

export interface MakerGardenServiceConfig {
  lotSize?: number;
}

/**
 * Calculate garden size based on product count
 * 1-2 = small, 3-5 = medium, 6-10 = large, 11+ = estate
 */
export function calculateGardenSize(productCount: number): GardenSize {
  if (productCount <= 2) return "small";
  if (productCount <= 5) return "medium";
  if (productCount <= 10) return "large";
  return "estate";
}

/**
 * Calculate total MRR from all products
 */
export function calculateTotalMRR(products: TreeData[]): number {
  return products.reduce((sum, product) => sum + product.mrr, 0);
}

/**
 * Calculate total customers from all products
 */
export function calculateTotalCustomers(products: TreeData[]): number {
  return products.reduce((sum, product) => sum + product.customers, 0);
}

/**
 * Extract maker info from cofounders data
 * Finds the cofounder matching the xHandle and extracts their name
 */
export function extractMakerInfo(
  xHandle: string,
  cofounders: Array<{ xHandle: string; xName: string | null }>
): { xName: string | null } {
  const normalizedHandle = xHandle.replace("@", "").toLowerCase();
  const cofounder = cofounders.find(
    (c) => c.xHandle.replace("@", "").toLowerCase() === normalizedHandle
  );
  return { xName: cofounder?.xName ?? null };
}
