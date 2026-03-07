# Known Bugs & Issues

## 🔴 BUG-001: Only 50 of ~5,000 startups rendered (pagination vs rate limit)

**Status:** Open — needs architecture change
**Severity:** High
**Found:** 2026-03-06

### Problem

TrustMRR has ~4,924 startups but rate limit is 20 requests/minute. With 50 results/page, fetching all startups requires 99 requests — impossible in a single request cycle. The `ForestService` stops paginating when `rateLimit.remaining < 5`, returning only the first page (50 startups).

### Impact

The forest shows 50 trees instead of ~5,000. The landing page stats and leaderboard are also limited to this subset.

### Root Cause

`ForestService.buildForest()` tries to fetch all pages synchronously in a single call. The rate limit of 20/min makes this impossible for the full dataset.

### Proposed Solution: Background Incremental Sync

**Phase 1: Persistent Cache**
- On first request, fetch page 1 (50 startups) and serve immediately
- Store in `forest_cache` Supabase table with TTL
- Return partial data with `{ complete: false, totalAvailable: 4924, totalFetched: 50 }`

**Phase 2: Background Sync Job**
- After serving first response, trigger a background sync
- Fetch 15 pages per minute (staying under 20 req/min limit)
- Append results to cache progressively
- Full sync of ~5,000 startups takes ~7 minutes
- Client polls or uses SSE to get updated forest as more data arrives

**Phase 3: Incremental Updates**
- Once full forest is cached, only re-sync every 1 hour
- Use `sort=listed-desc` to fetch newest startups first on re-sync
- Merge with existing cache instead of rebuilding

### Files Affected

- `src/lib/services/forest/ForestService.ts` — needs background sync logic
- `src/lib/services/cache/CacheService.ts` — needs append/merge capability
- `src/app/api/forest/route.ts` — needs to trigger background sync
- May need a dedicated `/api/sync/trigger` endpoint or cron job

### Workaround (current)

The app works with 50 startups. The top 50 by revenue are shown since the API sorts by `revenue-desc` by default. This is acceptable for MVP but the forest feels empty.

---

## 🟡 BUG-002: MRR=0 for startups with high revenue (one-time sales)

**Status:** Open — needs fallback logic
**Severity:** Medium
**Found:** 2026-03-06

### Problem

Many startups (e.g., Gumroad: $71k/30d revenue) have `mrr: 0` because they sell one-time products, not subscriptions. The tree tier is based solely on MRR, so these appear as `seed` tier despite significant revenue.

### Impact

High-revenue startups appear as tiny seeds in the forest. Misleading visualization.

### Proposed Solution

In `TreeCalculator.getTier()`, use `revenueLast30Days` as fallback when `mrr === 0`:

```typescript
function getEffectiveMRR(mrrCents: number, revenueLast30DaysCents: number): number {
  return mrrCents > 0 ? mrrCents : revenueLast30DaysCents;
}
```

### Files Affected

- `src/lib/services/tree/TreeCalculator.ts`
- `src/lib/services/tree/TreeService.ts`
- `src/lib/services/tree/__tests__/TreeCalculator.test.ts`

---

## 🟡 BUG-003: 78% of startups have 0 customers

**Status:** Open — data limitation
**Severity:** Low
**Found:** 2026-03-06

### Problem

Most TrustMRR entries return `customers: 0`. This makes most trees have no fruits, which looks visually empty.

### Impact

The fruit system — a core visual mechanic — is underutilized. Most trees are bare.

### Proposed Solution Options

1. **Use `activeSubscriptions` as fallback** when `customers === 0`
2. **Estimate customers** from revenue (e.g., MRR / average plan price)
3. **Accept it** and let the fruit system shine for startups that do report customers

Option 1 is simplest and most accurate.

### Files Affected

- `src/lib/services/tree/TreeService.ts` — use `activeSubscriptions` when `customers === 0`

---

## ✅ BUG-004: next-intl plugin missing from next.config.ts (FIXED)

**Status:** Fixed — 2026-03-06
**Severity:** Critical

`createNextIntlPlugin` was not wrapping `nextConfig`, causing `getTranslations()` to crash with 500 error on all pages. Fixed by adding the plugin wrapper to `next.config.ts`.
