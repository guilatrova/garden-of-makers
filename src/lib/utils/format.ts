/**
 * Format utilities for currency and numbers
 */

/**
 * Format MRR for display (cents to readable format)
 * Examples:
 *   500 cents -> $5/mo
 *   50000 cents -> $500/mo
 *   500000 cents -> $5k/mo
 *   50000000 cents -> $500k/mo
 */
export function formatMRR(mrrCents: number): string {
  const mrr = mrrCents / 100;
  
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
 */
export function formatRevenue(revenueCents: number): string {
  const revenue = revenueCents / 100;
  
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
 */
export function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return "—";
  return formatRevenue(priceCents);
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
