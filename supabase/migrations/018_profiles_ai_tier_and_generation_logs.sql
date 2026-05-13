-- Subscription tier for AI quotas (Stripe/payment wiring comes later; default free).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (ai_tier IN ('free', 'premium'));

COMMENT ON COLUMN public.profiles.ai_tier IS 'AI quota tier: free (default) or premium (higher limits).';

-- Server-side observability for AI calls (inserted by Edge Functions with service role).
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('scenario', 'suggestions')),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_trip_created
  ON public.ai_generation_logs (trip_id, created_at DESC);

ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- No client access; Edge Functions use service role.
CREATE POLICY "Deny all ai_generation_logs for anon/authenticated"
  ON public.ai_generation_logs FOR ALL
  USING (false)
  WITH CHECK (false);
