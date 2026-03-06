# Garden of Makers

> Your revenue, visualized as a living forest.

Every startup is a tree. MRR determines height. Customers become fruits. Powered by verified revenue data from TrustMRR.

**Live at:** `gardenofmakers.com` (TBD)

---

## Concept

Garden of Makers transforms verified startup revenue data into an interactive 3D forest. Each startup registered on TrustMRR becomes a tree that grows based on real MRR. Visitors fly through the forest, discover startups, and compare gardens.

### Core Loop

```
TrustMRR API → Verified Revenue Data → 3D Tree Generation → Shareable Garden → Viral Loop
```

### Why TrustMRR

No need to integrate Stripe, Lemon Squeezy, Paddle, or Creem individually. TrustMRR already aggregates verified revenue from **Stripe, Lemon Squeezy, Polar, RevenueCat, and DodoPayment**. One API, all providers. Revenue is verified — not self-reported.

### Why It Works

- **Zero friction:** no OAuth flows, no API keys from users — TrustMRR data is already public
- **Vanity-driven sharing:** beautiful garden screenshots on X/Twitter
- **Verified data:** trees reflect real revenue, not fantasy numbers
- **Competitive element:** compare gardens side-by-side
- **Rare achievements:** World Trees ($1M MRR) visible from anywhere in the forest

---

## Data Source: TrustMRR API

### Base URL
```
https://trustmrr.com/api/v1
```

### Authentication
```
Authorization: Bearer tmrr_<api_key>
```

Rate limit: 20 requests/minute per key.

### Endpoints Used

#### `GET /startups` — List & filter startups

Query params:
| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (starts at 1) |
| `limit` | integer | Results per page (max 50) |
| `sort` | string | `revenue-desc`, `growth-desc`, etc. |
| `category` | string | `ai`, `saas`, `developer-tools`, `fintech`, `ecommerce`, etc. |
| `minMrr` / `maxMrr` | number | MRR range in USD cents |
| `minRevenue` / `maxRevenue` | number | Last 30 days revenue in USD cents |
| `xHandle` | string | Filter by founder's X handle |

Response fields (per startup):
| Field | Type | Maps to |
|---|---|---|
| `name` | string | Tree label |
| `slug` | string | URL identifier |
| `icon` | string \| null | Tree nameplate icon |
| `description` | string \| null | Tooltip / detail panel |
| `website` | string \| null | Link from detail panel |
| `category` | string \| null | Forest biome / zone |
| `paymentProvider` | string | Badge on tree (stripe, lemonsqueezy, polar, revenuecat, dodopayment) |
| `revenue.mrr` | number (cents) | **Tree height / tier** |
| `revenue.last30Days` | number (cents) | Revenue badge |
| `revenue.total` | number (cents) | All-time stat |
| `customers` | number | **Fruit count** |
| `activeSubscriptions` | number | Active sub badge |
| `growth30d` | number \| null | Growth indicator (leaf animation speed) |
| `xHandle` | string \| null | Founder link |
| `onSale` | boolean | "For Sale" sign on tree |
| `askingPrice` | number \| null | Price tag if on sale |

#### `GET /startups/{slug}` — Startup detail

Additional fields:
| Field | Type | Maps to |
|---|---|---|
| `techStack[]` | object[] | Tech badges on tree trunk |
| `cofounders[]` | object[] | Founder nameplates |
| `xFollowerCount` | number \| null | Social stat |
| `isMerchantOfRecord` | boolean | MoR badge |
| `description` | string | Full description (not truncated) |

### Pagination
```json
{
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 50,
    "hasMore": true
  }
}
```

### Caching Strategy

- **Full forest data:** Fetch all startups on build (SSG/ISR) + revalidate every 1 hour
- **Individual startup:** On-demand fetch when user clicks a tree, cached 15 minutes
- **Server-side only:** API key never exposed to client. All TrustMRR calls happen in server components or API routes

---

## Tree Evolution (MRR Tiers)

Trees are **tall**. Height dominates. Visible from far away.

| MRR (USD) | Stage | Relative Height | Visual Reference |
|---|---|---|---|
| $0 | Seed | Ground level | Pixel dot on terrain |
| $1 – $100 | Sprout | 1x | Tall grass |
| $100 – $1k | Shrub | 2x | Dense bush |
| $1k – $5k | Young Tree | 5x | Thin birch |
| $5k – $25k | Mature Tree | 12x | Oak |
| $25k – $100k | Great Tree | 25x | Young sequoia |
| $100k – $500k | Ancient Tree | 50x | Mature sequoia — visible from any point in the forest |
| $500k – $1M+ | World Tree | 100x+ | Yggdrasil — massive trunk, branches cross the sky, visible from the entire forest |

### World Tree Special Treatment

- Unique trunk texture (bark patterns, glowing veins)
- Branches that extend into the skybox
- Light particles falling from branches
- Roots that spread across the ground into neighboring areas
- Atmospheric fog/glow around the base
- Custom shader effects (subsurface scattering on leaves)

### Tier Calculation

```typescript
function getTier(mrrCents: number): TreeTier {
  const mrr = mrrCents / 100; // convert cents to dollars
  if (mrr === 0) return 'seed';
  if (mrr <= 100) return 'sprout';
  if (mrr <= 1_000) return 'shrub';
  if (mrr <= 5_000) return 'young';
  if (mrr <= 25_000) return 'mature';
  if (mrr <= 100_000) return 'great';
  if (mrr <= 500_000) return 'ancient';
  return 'world';
}
```

---

## Fruit System (Customer Count)

| Fruit | Represents | Visual | Size |
|---|---|---|---|
| 🫐 Blueberry | 1 customer | Small, clustered in bunches | Tiny |
| 🍎 Apple | 10 customers | Medium, clearly visible | Medium |
| 🍊 Orange | 100 customers | Large, bright colored | Large |
| 🍉 Watermelon | 1,000 customers | Huge, rare, eye-catching | Very Large |

### Fruit Breakdown

```typescript
function getFruitBreakdown(customers: number): FruitBreakdown {
  const watermelons = Math.floor(customers / 1000);
  const remaining1 = customers % 1000;
  const oranges = Math.floor(remaining1 / 100);
  const remaining2 = remaining1 % 100;
  const apples = Math.floor(remaining2 / 10);
  const blueberries = remaining2 % 10;
  return { watermelons, oranges, apples, blueberries };
}
```

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| **Next.js** | 16 | App Router, API routes, SSR/ISR, Turbopack |
| **React** | 19 | UI components |
| **TypeScript** | 5 | Type safety everywhere |
| **Three.js** | latest | 3D engine via @react-three/fiber + drei |
| **Supabase** | latest | PostgreSQL, GitHub OAuth, Row Level Security |
| **Tailwind CSS** | 4 | Styling with pixel font (Silkscreen) |
| **Vitest** | latest | Unit + integration tests |
| **next-intl** | latest | i18n (en-US + pt-BR) |
| **Vercel** | — | Hosting + edge functions + ISR |

---

## Architecture

Following the **Provider-Service-Facade-Route** pattern.

### Architectural Layers

| Layer | Location | Responsibility | Business Logic? |
|---|---|---|---|
| **Providers** | `src/lib/providers/` | Wrappers for external APIs (TrustMRR) | No (translation only) |
| **Services** | `src/lib/services/` | Domain logic (tree generation, MRR calc, caching) | Yes |
| **Facades** | `src/lib/services/.../` | Orchestrates multiple services | Yes (orchestration) |
| **Routes** | `src/app/api/` | HTTP handling, auth, request validation | No |

### Provider Rules

- Providers translate external API responses to internal types. No business logic.
- TrustMRR API key lives in env vars, never exposed client-side.
- All TrustMRR calls go through `TrustMRRProvider`.

### Service Rules

- One domain per service. Single responsibility.
- Services own their types in a co-located `types.ts`.
- Browser Supabase client for RLS-protected CRUD (user preferences, saved gardens).
- Server Supabase client for anything touching API keys or cross-user data.

### Route Rules

- Routes handle HTTP, auth, parse body, call Service/Facade, return response.
- **Strictly no business logic in routes.**

---

## Directory Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                          # Landing page
│   │   ├── layout.tsx                        # Root layout
│   │   ├── forest/
│   │   │   └── page.tsx                      # Forest explorer (all startups, fly through)
│   │   ├── garden/
│   │   │   └── [slug]/
│   │   │       └── page.tsx                  # Single startup garden view
│   │   ├── compare/
│   │   │   └── page.tsx                      # Side-by-side comparison
│   │   ├── leaderboard/
│   │   │   └── page.tsx                      # Top startups ranked
│   │   └── about/
│   │       └── page.tsx                      # How it works
│   ├── api/
│   │   ├── startups/
│   │   │   ├── route.ts                      # GET - paginated startup list (proxies TrustMRR with caching)
│   │   │   └── [slug]/
│   │   │       └── route.ts                  # GET - single startup detail
│   │   ├── forest/
│   │   │   └── route.ts                      # GET - forest data (all trees with positions)
│   │   └── share/
│   │       └── [slug]/
│   │           └── route.ts                  # GET - generate OG share card image
│   └── auth/
│       └── callback/
│           └── route.ts                      # Supabase auth callback (GitHub OAuth)
│
├── components/
│   ├── forest/
│   │   ├── ForestScene.tsx                   # Main R3F Canvas + scene setup
│   │   ├── Tree.tsx                          # Single tree component (parameterized by tier)
│   │   ├── TreeLOD.tsx                       # LOD wrapper (full detail vs billboard sprite)
│   │   ├── Fruit.tsx                         # Single fruit mesh (parameterized by type)
│   │   ├── FruitCluster.tsx                  # Distributes fruits on tree canopy
│   │   ├── Terrain.tsx                       # Ground plane, grass patches, paths
│   │   ├── FlightCamera.tsx                  # Free flight camera (WASD + mouse)
│   │   ├── WorldTreeEffects.tsx              # Particles, glow, roots for $500k+ trees
│   │   ├── TreeLabel.tsx                     # HTML overlay: name, MRR, category
│   │   ├── ForSaleSign.tsx                   # "For Sale" sign mesh on tree
│   │   └── Skybox.tsx                        # Sky, clouds, lighting
│   ├── ui/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── StartupCard.tsx                   # 2D card for leaderboard / list view
│   │   ├── CategoryFilter.tsx                # Filter by startup category
│   │   ├── SearchBar.tsx                     # Search by name or xHandle
│   │   └── ShareButton.tsx                   # Share to X/Twitter
│   ├── detail/
│   │   ├── StartupDrawer.tsx                 # Side panel when clicking a tree
│   │   ├── TechStackBadges.tsx               # Tech stack pills
│   │   ├── RevenueStats.tsx                  # MRR, last30d, total, growth
│   │   ├── FounderCard.tsx                   # Cofounder info + X link
│   │   └── FruitLegend.tsx                   # Visual legend for fruit types
│   └── share/
│       └── ShareCard.tsx                     # Downloadable OG image card
│
├── lib/
│   ├── providers/
│   │   └── trustmrr/
│   │       ├── TrustMRRProvider.ts           # API client: list, getBySlug
│   │       └── types.ts                      # TrustMRR API response types
│   ├── services/
│   │   ├── forest/
│   │   │   ├── ForestService.ts              # Fetches startups, generates forest layout
│   │   │   ├── ForestLayoutEngine.ts         # Positions trees in 3D space (clustering by category)
│   │   │   ├── types.ts                      # ForestData, TreePosition
│   │   │   └── index.ts
│   │   ├── tree/
│   │   │   ├── TreeService.ts                # Maps startup data → tree visual params
│   │   │   ├── TreeCalculator.ts             # MRR → tier, customers → fruits
│   │   │   ├── types.ts                      # TreeData, TreeTier, FruitBreakdown
│   │   │   └── index.ts
│   │   ├── cache/
│   │   │   ├── CacheService.ts               # ISR + in-memory cache for TrustMRR data
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── share/
│   │       ├── ShareService.ts               # OG image generation (satori or similar)
│   │       ├── types.ts
│   │       └── index.ts
│   ├── constants/
│   │   ├── tiers.ts                          # MRR thresholds, heights, visual params per tier
│   │   ├── fruits.ts                         # Fruit type definitions, values, sizes
│   │   └── categories.ts                     # TrustMRR categories → forest biome mapping
│   └── utils/
│       └── supabase/
│           ├── client.ts                     # Browser Supabase client
│           ├── server.ts                     # Server Supabase client
│           └── middleware.ts                 # Auth middleware
│
├── hooks/
│   ├── useForest.ts                          # Fetch forest data + pagination
│   ├── useStartupDetail.ts                   # Fetch single startup on tree click
│   └── useFlightControls.ts                  # WASD + mouse flight input
│
├── messages/
│   ├── en-US.json
│   └── pt-BR.json
│
└── types/
    └── index.ts                              # Shared global types
```

---

## Key Types

```typescript
// === Tree Tiers ===

type TreeTier = 'seed' | 'sprout' | 'shrub' | 'young' | 'mature' | 'great' | 'ancient' | 'world';

interface TierConfig {
  tier: TreeTier;
  minMrrCents: number;
  maxMrrCents: number;
  relativeHeight: number;       // 1x, 2x, 5x, 12x, 25x, 50x, 100x
  trunkRadius: number;
  canopyRadius: number;
  hasSpecialEffects: boolean;   // true for ancient + world
}

// === Fruits ===

type FruitType = 'blueberry' | 'apple' | 'orange' | 'watermelon';

interface FruitBreakdown {
  watermelons: number;    // each = 1,000 customers
  oranges: number;        // each = 100 customers
  apples: number;         // each = 10 customers
  blueberries: number;    // each = 1 customer
}

// === Tree (rendered in 3D) ===

interface TreeData {
  slug: string;
  name: string;
  icon: string | null;
  category: string | null;
  paymentProvider: string;
  mrrCents: number;
  revenueLast30DaysCents: number;
  totalRevenueCents: number;
  customers: number;
  activeSubscriptions: number;
  growth30d: number | null;
  onSale: boolean;
  askingPriceCents: number | null;
  xHandle: string | null;
  // Computed
  tier: TreeTier;
  fruits: FruitBreakdown;
  position: { x: number; y: number; z: number };
}

// === Forest ===

interface ForestData {
  trees: TreeData[];
  totalStartups: number;
  categories: string[];
  lastSyncedAt: string;
}

// === TrustMRR API types (provider layer) ===

interface TrustMRRStartup {
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
    last30Days: number;       // cents
    mrr: number;              // cents
    total: number;            // cents
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

interface TrustMRRStartupDetail extends TrustMRRStartup {
  xFollowerCount: number | null;
  isMerchantOfRecord: boolean;
  techStack: Array<{ slug: string; category: string }>;
  cofounders: Array<{ xHandle: string; xName: string | null }>;
}

interface TrustMRRListResponse {
  data: TrustMRRStartup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

interface TrustMRRDetailResponse {
  data: TrustMRRStartupDetail;
}
```

---

## Database Schema (Supabase / PostgreSQL)

Minimal schema — TrustMRR is the source of truth for startup data. Supabase stores user preferences and cached forest state.

```sql
-- User profiles (for future features: saved gardens, preferences)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  favorite_startups TEXT[] DEFAULT '{}',     -- array of slugs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cached forest data (avoid hitting TrustMRR rate limits)
CREATE TABLE public.forest_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,            -- e.g. 'forest_all', 'forest_saas'
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cache: server-side only (service role)
CREATE POLICY "Cache readable by all"
  ON public.forest_cache FOR SELECT USING (true);
-- INSERT/UPDATE/DELETE via service role key only (no RLS needed, service role bypasses)

-- Indexes
CREATE INDEX idx_forest_cache_key ON public.forest_cache(cache_key);
CREATE INDEX idx_forest_cache_expires ON public.forest_cache(expires_at);
```

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/startups` | Public | List startups (proxies TrustMRR with server-side caching) |
| `GET` | `/api/startups/[slug]` | Public | Single startup detail |
| `GET` | `/api/forest` | Public | Full forest data: all trees with computed positions, tiers, fruits |
| `GET` | `/api/share/[slug]` | Public | Generate OG share card image for a startup |

### Data Flow

```
Client requests forest → /api/forest →
  CacheService checks forest_cache table →
    Cache hit + not expired → return cached data
    Cache miss or expired →
      ForestService.buildForest() →
        TrustMRRProvider.listStartups(page=1..N, limit=50) →
        TreeService.mapToTreeData(startup) for each →
        ForestLayoutEngine.positionTrees(trees) →
        Store in forest_cache →
        Return ForestData
```

---

## Forest Layout Engine

### Positioning Strategy

Trees are grouped by **category** into biomes/zones:
- `ai` → Northeast zone
- `saas` → Central zone
- `developer-tools` → East zone
- `ecommerce` → South zone
- etc.

Within each zone, trees are placed using a **spiral pattern** radiating from the zone center. Taller trees (higher MRR) are placed closer to the center of their zone. This creates natural "downtown" areas where the big trees cluster.

### World Trees

World Trees ($500k+ MRR) get special placement: they're visible from any zone. Their roots extend beyond their zone boundary. They get extra spacing so nothing crowds them.

---

## Quality Standards

### Validation Commands

```bash
npm run lint         # ESLint — zero errors
npm run test         # Vitest — all tests pass
npm run i18n:check   # en-US and pt-BR translation keys in sync
npm run build        # Next.js production build — catches type errors
```

**All four must pass with zero errors before any code is considered ready.**

### Rules

1. **No hardcoded strings** — all user-facing text goes through `next-intl` via `useTranslations`. Every key must exist in both `en-US.json` and `pt-BR.json`.
2. **No business logic in routes** — routes handle HTTP, auth, validation. Logic lives in Services.
3. **Providers are dumb** — they translate TrustMRR API responses to internal types. No business logic.
4. **Services are focused** — one domain per service. Use Facades to orchestrate.
5. **Server-side API calls only** — TrustMRR API key never exposed to client. All calls via server components or API routes.
6. **Type everything** — no `any`. Provider types mirror TrustMRR exactly. Service types are internal domain types.
7. **Test business logic** — `TreeCalculator`, `ForestLayoutEngine`, fruit breakdown, tier mapping. Minimum 25 unit tests before launch.
8. **Cache aggressively** — TrustMRR rate limit is 20/min. ISR (1h revalidation) + database cache + in-memory cache.
9. **RLS on every table** — no exceptions.
10. **Monetary values in cents** — match TrustMRR convention. Convert to dollars only at render time.

---

## Monetization (Post-MVP)

| Item | Type | Description |
|---|---|---|
| Garden decorations | Cosmetic | Fences, benches, ponds, lanterns, mushrooms around your tree |
| Seasons | Global skin | Permanent spring / snow / autumn theme |
| Animals | Cosmetic | Fox, rabbits, birds near your tree |
| Premium placement | Boost | Pin your tree to a prime location in the forest |
| Sponsored categories | B2B | Brands sponsor a biome zone |

---

## MVP Scope (v1.0)

### In Scope

1. Landing page explaining the concept
2. Forest explorer: 3D scene with all TrustMRR startups as trees
3. Tree tiers (seed → World Tree) based on MRR
4. Fruit system based on customer count
5. Free flight camera through forest
6. Click tree → detail drawer (name, MRR, customers, growth, category, link)
7. Category filter (biome zones)
8. Search by name or xHandle
9. "For Sale" signs on trees with `onSale: true`
10. Share card generation (OG image per startup)
11. Leaderboard (top startups ranked)
12. i18n (en-US + pt-BR)
13. ISR + cache layer for TrustMRR data

### Out of Scope (v1.0)

- User accounts / GitHub OAuth (v1.1)
- Favorite startups / saved gardens (v1.1)
- Compare mode (v1.1)
- Customization shop / monetization (v2.0)
- Real-time updates / webhooks (v2.0)
- Mobile-optimized 3D (basic responsive only)

---

## Milestones

### M1: Foundation
- Project setup (Next.js 16, Supabase, Tailwind 4, R3F, next-intl)
- TrustMRRProvider with full types
- CacheService (ISR + DB cache)
- DB schema + migrations + RLS
- Environment setup (API keys, Supabase project)

### M2: Tree Engine
- TreeCalculator (MRR → tier, customers → fruits)
- Tree 3D component (8 visual tiers, height-driven)
- Fruit 3D components (4 types, instanced meshes)
- ForestLayoutEngine (category zones, spiral placement)
- LOD system (detail near, billboard far)
- World Tree VFX (particles, glow, roots)

### M3: Forest Scene
- ForestScene (R3F Canvas, terrain, skybox, lighting)
- FlightCamera (WASD + mouse, smooth interpolation)
- TreeLabel (HTML overlay on hover)
- ForSaleSign (mesh on trees with onSale)
- Terrain (ground, grass patches, zone boundaries)

### M4: Pages & UI
- Landing page
- Forest explorer page (`/forest`)
- Startup detail drawer (click tree → side panel)
- Leaderboard page (`/leaderboard`)
- Category filter + search bar
- Share card generation (`/api/share/[slug]`)
- i18n (en-US + pt-BR)

### M5: Polish & Launch
- OG meta tags per startup
- Performance: instancing audit, LOD tuning, draw call budget
- Unit tests (25+ minimum): TreeCalculator, ForestLayoutEngine, FruitBreakdown, TrustMRRProvider
- Responsive layout (3D canvas + UI panels)
- Production deploy to Vercel
- Landing page copy + visuals
