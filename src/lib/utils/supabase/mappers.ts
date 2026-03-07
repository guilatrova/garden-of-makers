/**
 * Maps Supabase startup row to TrustMRRStartup format.
 * Used across routes and services to avoid repeating the mapping.
 */

import { TrustMRRStartup } from "@/lib/providers/trustmrr";
import { Database } from "./database.types";

export type StartupRow = Database["public"]["Tables"]["startups"]["Row"];

export function mapRowToStartup(row: StartupRow): TrustMRRStartup {
  return {
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    website: row.website,
    country: row.country,
    foundedDate: row.founded_date,
    category: row.category,
    paymentProvider: row.payment_provider,
    targetAudience: row.target_audience,
    revenue: {
      last30Days: row.revenue_last_30d_cents,
      mrr: row.mrr_cents,
      total: row.revenue_total_cents,
    },
    customers: row.customers,
    activeSubscriptions: row.active_subscriptions,
    askingPrice: row.asking_price_cents,
    profitMarginLast30Days: row.profit_margin_last_30d,
    growth30d: row.growth_30d,
    multiple: row.multiple,
    onSale: row.on_sale,
    firstListedForSaleAt: row.first_listed_for_sale_at,
    xHandle: row.x_handle,
  };
}
