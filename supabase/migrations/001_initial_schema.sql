-- Initial schema for Garden of Makers
-- Creates profiles and forest_cache tables with RLS policies

-- User profiles (for future features: saved gardens, preferences)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  favorite_startups TEXT[] DEFAULT '{}', -- array of slugs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cached forest data (avoid hitting TrustMRR rate limits)
CREATE TABLE IF NOT EXISTS public.forest_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL, -- e.g. 'forest_all', 'forest_saas'
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, owner write
CREATE POLICY IF NOT EXISTS "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cache: readable by all, writable only via service role
CREATE POLICY IF NOT EXISTS "Cache readable by all"
  ON public.forest_cache FOR SELECT USING (true);

-- Note: INSERT/UPDATE/DELETE on cache should be done via service role key
-- Service role bypasses RLS, so no policy needed for write operations

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forest_cache_key ON public.forest_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_forest_cache_expires ON public.forest_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Trigger to update updated_at timestamp on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
