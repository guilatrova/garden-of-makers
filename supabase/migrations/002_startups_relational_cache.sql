-- Migration 002: Replace JSONB forest_cache with relational startup tables
-- Enables indexed queries by xHandle, category, slug, etc.

-- Drop old cache table
DROP TABLE IF EXISTS public.forest_cache CASCADE;

-- =============================================================================
-- Startups (cached from TrustMRR)
-- =============================================================================
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identity
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  website TEXT,
  country TEXT,
  founded_date TIMESTAMPTZ,
  category TEXT,
  payment_provider TEXT NOT NULL,
  target_audience TEXT,
  -- Revenue
  mrr_cents BIGINT NOT NULL DEFAULT 0,
  revenue_last_30d_cents BIGINT NOT NULL DEFAULT 0,
  revenue_total_cents BIGINT NOT NULL DEFAULT 0,
  -- Customers
  customers INTEGER NOT NULL DEFAULT 0,
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  -- Growth & valuation
  growth_30d DOUBLE PRECISION,
  profit_margin_last_30d DOUBLE PRECISION,
  multiple DOUBLE PRECISION,
  -- Sale
  on_sale BOOLEAN NOT NULL DEFAULT false,
  asking_price_cents BIGINT,
  first_listed_for_sale_at TIMESTAMPTZ,
  -- Social
  x_handle TEXT,
  -- Sync metadata
  _last_fetch_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Startup detail (extra fields from /startups/{slug} endpoint)
-- =============================================================================
CREATE TABLE public.startup_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  x_follower_count INTEGER,
  is_merchant_of_record BOOLEAN DEFAULT false,
  -- Sync metadata
  _last_fetch_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(startup_id)
);

-- =============================================================================
-- Tech stack (many-to-many via startup_details)
-- =============================================================================
CREATE TABLE public.startup_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  tech_slug TEXT NOT NULL,
  tech_category TEXT NOT NULL,
  UNIQUE(startup_id, tech_slug)
);

-- =============================================================================
-- Cofounders
-- =============================================================================
CREATE TABLE public.startup_cofounders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  x_handle TEXT NOT NULL,
  x_name TEXT,
  UNIQUE(startup_id, x_handle)
);

-- =============================================================================
-- Sync state (tracks incremental sync progress)
-- =============================================================================
CREATE TABLE public.sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_key TEXT UNIQUE NOT NULL DEFAULT 'main',
  last_page INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER,
  total_startups INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_run_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_cofounders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_state ENABLE ROW LEVEL SECURITY;

-- All startup data is public (read-only via anon, write via service role)
CREATE POLICY "Startups are publicly readable"
  ON public.startups FOR SELECT USING (true);

CREATE POLICY "Startup details are publicly readable"
  ON public.startup_details FOR SELECT USING (true);

CREATE POLICY "Tech stack is publicly readable"
  ON public.startup_tech_stack FOR SELECT USING (true);

CREATE POLICY "Cofounders are publicly readable"
  ON public.startup_cofounders FOR SELECT USING (true);

CREATE POLICY "Sync state is publicly readable"
  ON public.sync_state FOR SELECT USING (true);

-- Write operations happen via service role (bypasses RLS)

-- =============================================================================
-- Indexes
-- =============================================================================

-- Primary lookup patterns
CREATE INDEX idx_startups_slug ON public.startups(slug);
CREATE INDEX idx_startups_x_handle ON public.startups(x_handle);
CREATE INDEX idx_startups_category ON public.startups(category);
CREATE INDEX idx_startups_on_sale ON public.startups(on_sale) WHERE on_sale = true;

-- Sorting patterns
CREATE INDEX idx_startups_mrr_desc ON public.startups(mrr_cents DESC);
CREATE INDEX idx_startups_revenue_30d_desc ON public.startups(revenue_last_30d_cents DESC);
CREATE INDEX idx_startups_growth_desc ON public.startups(growth_30d DESC NULLS LAST);

-- Staleness check
CREATE INDEX idx_startups_last_fetch ON public.startups(_last_fetch_at);

-- Relationships
CREATE INDEX idx_startup_details_startup ON public.startup_details(startup_id);
CREATE INDEX idx_startup_tech_stack_startup ON public.startup_tech_stack(startup_id);
CREATE INDEX idx_startup_cofounders_startup ON public.startup_cofounders(startup_id);
CREATE INDEX idx_startup_cofounders_x_handle ON public.startup_cofounders(x_handle);

-- Sync state
CREATE INDEX idx_sync_state_key ON public.sync_state(sync_key);

-- =============================================================================
-- Updated_at triggers
-- =============================================================================
CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_details_updated_at
  BEFORE UPDATE ON public.startup_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
