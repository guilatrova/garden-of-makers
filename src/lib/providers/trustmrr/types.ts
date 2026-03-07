/**
 * TrustMRR API Response Types
 * Mirrors the TrustMRR API exactly - no business logic
 * @see https://trustmrr.com/api/v1
 */

export interface TrustMRRStartup {
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  foundedDate: string | null;
  category: string | null;
  paymentProvider: string;
  targetAudience: string | null;
  revenue: {
    last30Days: number; // cents (from API), converted to dollars by mapper
    mrr: number; // cents (from API), converted to dollars by mapper
    total: number; // cents (from API), converted to dollars by mapper
  };
  customers: number;
  activeSubscriptions: number;
  askingPrice: number | null;
  profitMarginLast30Days: number | null;
  growth30d: number | null;
  multiple: number | null;
  onSale: boolean;
  firstListedForSaleAt: string | null;
  xHandle: string | null;
}

export interface TrustMRRStartupDetail extends TrustMRRStartup {
  xFollowerCount: number | null;
  isMerchantOfRecord: boolean;
  techStack: Array<{ slug: string; category: string }>;
  cofounders: Array<{ xHandle: string; xName: string | null }>;
}

export interface TrustMRRListResponse {
  data: TrustMRRStartup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface TrustMRRDetailResponse {
  data: TrustMRRStartupDetail;
}

// Query parameters for listStartups
export interface TrustMRRListParams {
  page?: number;
  limit?: number;
  sort?:
    | "revenue-desc"
    | "revenue-asc"
    | "price-desc"
    | "price-asc"
    | "multiple-asc"
    | "multiple-desc"
    | "growth-desc"
    | "growth-asc"
    | "listed-desc"
    | "listed-asc"
    | "best-deal";
  category?: string;
  minMrr?: number;
  maxMrr?: number;
  minRevenue?: number;
  maxRevenue?: number;
  xHandle?: string;
  onSale?: "true" | "false";
  minGrowth?: number;
  maxGrowth?: number;
  minPrice?: number;
  maxPrice?: number;
}

// Rate limit information from response headers
export interface TrustMRRRateLimit {
  limit: number;
  remaining: number;
  resetAt: Date;
}
