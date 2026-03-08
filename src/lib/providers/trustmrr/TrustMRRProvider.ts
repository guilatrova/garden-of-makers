import {
  TrustMRRListResponse,
  TrustMRRDetailResponse,
  TrustMRRListParams,
  TrustMRRRateLimit,
} from "./types";

const TRUSTMRR_BASE_URL = "https://trustmrr.com/api/v1";

/**
 * TrustMRR API Provider
 * Server-side only - never expose API key to client
 */
export class TrustMRRProvider {
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.TRUSTMRR_API_KEY;
    this.baseUrl = TRUSTMRR_BASE_URL;
  }

  /**
   * Validate that API key is available
   */
  private ensureApiKey(): string {
    if (!this.apiKey) {
      throw new Error(
        "TrustMRR API key is required. Set TRUSTMRR_API_KEY environment variable."
      );
    }
    return this.apiKey;
  }

  /**
   * List startups with optional filtering
   * GET /api/v1/startups
   */
  async listStartups(
    params?: TrustMRRListParams
  ): Promise<{ response: TrustMRRListResponse; rateLimit: TrustMRRRateLimit }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.sort) queryParams.set("sort", params.sort);
    if (params?.category) queryParams.set("category", params.category);
    if (params?.minMrr) queryParams.set("minMrr", params.minMrr.toString());
    if (params?.maxMrr) queryParams.set("maxMrr", params.maxMrr.toString());
    if (params?.minRevenue)
      queryParams.set("minRevenue", params.minRevenue.toString());
    if (params?.maxRevenue)
      queryParams.set("maxRevenue", params.maxRevenue.toString());
    if (params?.xHandle) queryParams.set("xHandle", params.xHandle);
    if (params?.onSale) queryParams.set("onSale", params.onSale);
    if (params?.minGrowth)
      queryParams.set("minGrowth", params.minGrowth.toString());
    if (params?.maxGrowth)
      queryParams.set("maxGrowth", params.maxGrowth.toString());
    if (params?.minPrice)
      queryParams.set("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      queryParams.set("maxPrice", params.maxPrice.toString());

    const queryString = queryParams.toString();
    const url = `${this.baseUrl}/startups${queryString ? `?${queryString}` : ""}`;

    const result = await this.fetchWithAuth<TrustMRRListResponse>(url);
    return result;
  }

  /**
   * Get a single startup by slug
   * GET /api/v1/startups/{slug}
   */
  async getStartup(
    slug: string
  ): Promise<{ response: TrustMRRDetailResponse; rateLimit: TrustMRRRateLimit }> {
    const url = `${this.baseUrl}/startups/${encodeURIComponent(slug)}`;
    const result = await this.fetchWithAuth<TrustMRRDetailResponse>(url);
    return result;
  }

  /**
   * Internal fetch method with auth and rate limit handling
   */
  private async fetchWithAuth<T>(
    url: string
  ): Promise<{ response: T; rateLimit: TrustMRRRateLimit }> {
    const apiKey = this.ensureApiKey();
    const maxRetries = 3;

    let lastError: Error | undefined;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        return await this.parseResponse<T>(response, url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          const delay = 1000 * 2 ** attempt; // 1s, 2s, 4s
          console.warn(`[TrustMRR] fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`, lastError.message);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastError!;
  }

  private async parseResponse<T>(
    response: Response,
    url: string
  ): Promise<{ response: T; rateLimit: TrustMRRRateLimit }> {
    // Parse rate limit headers
    const rateLimit: TrustMRRRateLimit = {
      limit: parseInt(response.headers.get("X-RateLimit-Limit") ?? "20", 10),
      remaining: parseInt(
        response.headers.get("X-RateLimit-Remaining") ?? "0",
        10
      ),
      resetAt: new Date(
        parseInt(response.headers.get("X-RateLimit-Reset") ?? "0", 10) * 1000
      ),
    };

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          `TrustMRR rate limit exceeded. Resets at ${rateLimit.resetAt.toISOString()}`
        );
      }
      if (response.status === 401) {
        throw new Error("TrustMRR API authentication failed. Check your API key.");
      }
      if (response.status === 404) {
        throw new Error(`Startup not found: ${url}`);
      }
      throw new Error(
        `TrustMRR API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as T;

    return {
      response: data,
      rateLimit,
    };
  }
}
