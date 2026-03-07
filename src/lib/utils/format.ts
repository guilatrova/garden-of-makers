/**
 * Format utilities for currency and numbers
 * All monetary values from the TrustMRR API are in dollars.
 */

/**
 * Format MRR for display
 * Input is dollars (e.g. 15088 = $15,088)
 */
export function formatMRR(mrr: number): string {
  if (mrr >= 1_000_000) {
    return `$${(mrr / 1_000_000).toFixed(1)}M/mo`;
  }
  if (mrr >= 1_000) {
    return `$${(mrr / 1_000).toFixed(1)}k/mo`;
  }
  return `$${Math.round(mrr)}/mo`;
}

/**
 * Format revenue for display
 * Input is dollars
 */
export function formatRevenue(revenue: number): string {
  if (revenue === 0) return "";
  if (revenue >= 1_000_000) {
    return `$${(revenue / 1_000_000).toFixed(1)}M`;
  }
  if (revenue >= 1_000) {
    return `$${(revenue / 1_000).toFixed(1)}k`;
  }
  return `$${Math.round(revenue)}`;
}

/**
 * Format asking price for display
 * Input is dollars
 */
export function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return formatRevenue(price);
}

/**
 * Format asking price for 3D sign labels
 * Input is dollars
 */
export function formatAskingPrice(dollars: number): string {
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(0)}k`;
  return `$${dollars.toFixed(0)}`;
}

/**
 * Format growth as percentage
 */
export function formatGrowth(growth: number | null): { text: string; positive: boolean | null } {
  if (growth === null) return { text: "—", positive: null };
  const percentage = Math.round(growth * 100);
  return {
    text: growth > 0 ? `+${percentage}%` : `${percentage}%`,
    positive: growth > 0,
  };
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format customer count with fruit breakdown
 */
export function formatCustomerCount(customers: number): string {
  if (customers >= 1000) {
    return `${(customers / 1000).toFixed(1)}k`;
  }
  return customers.toString();
}
