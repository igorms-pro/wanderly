-- Migration: 009_activity_planning_fields.sql
-- Description: Add fields needed for planning view (event): cost range, transport, who participates
-- Dependencies: 001_initial_schema.sql, 002_rls_policies.sql, 007_trip_constraints.sql
--
-- Aligns with docs/design/planning-view-brainstorm.md:
-- - Coût fourchette (cost_min_cents, cost_max_cents)
-- - Transport (transport_type, transport_notes, transport_duration_minutes, transport_cost_cents)
-- - Qui participe par activité (table activity_participants)

-- ============================================================================
-- ACTIVITIES: fourchette de coût
-- ============================================================================
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS cost_min_cents INTEGER,
  ADD COLUMN IF NOT EXISTS cost_max_cents INTEGER;

COMMENT ON COLUMN public.activities.cost_min_cents IS 'Optional: lower bound of cost range (displayed as X–Y if both set)';
COMMENT ON COLUMN public.activities.cost_max_cents IS 'Optional: upper bound of cost range';

-- Optional check: if both set, min <= max
ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS valid_cost_range;
ALTER TABLE public.activities
  ADD CONSTRAINT valid_cost_range CHECK (
    cost_min_cents IS NULL OR cost_max_cents IS NULL OR cost_min_cents <= cost_max_cents
  );

-- ============================================================================
-- ACTIVITIES: transport (MVP = champs simples par activité)
-- ============================================================================
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS transport_type TEXT,
  ADD COLUMN IF NOT EXISTS transport_notes TEXT,
  ADD COLUMN IF NOT EXISTS transport_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS transport_cost_cents INTEGER;

COMMENT ON COLUMN public.activities.transport_type IS 'e.g. foot, car, train, taxi, bike (optional)';
COMMENT ON COLUMN public.activities.transport_notes IS 'Free text: how to get there / from previous activity';
COMMENT ON COLUMN public.activities.transport_duration_minutes IS 'Optional duration in minutes';
COMMENT ON COLUMN public.activities.transport_cost_cents IS 'Optional cost of transport in cents';

-- ============================================================================
-- ACTIVITY_PARTICIPANTS: qui participe à quelle activité (optionnel)
-- ============================================================================
-- Utilisé seulement si on veut afficher "X et Y font cette activité" (sous-ensemble des membres).
-- Par défaut = tous les membres du trip ; la table peut rester vide au début.
CREATE TABLE IF NOT EXISTS public.activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_participants_activity_id
  ON public.activity_participants(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_user_id
  ON public.activity_participants(user_id);

ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;

-- Trip members can view participants for activities of their trip
CREATE POLICY "Trip members can view activity_participants"
  ON public.activity_participants FOR SELECT
  USING (
    public.is_trip_member(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  );

-- Writers (owner, editor, moderator) can manage participants for activities of their trip
CREATE POLICY "Writers can insert activity_participants"
  ON public.activity_participants FOR INSERT
  WITH CHECK (
    public.can_write_trip(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  );

CREATE POLICY "Writers can update activity_participants"
  ON public.activity_participants FOR UPDATE
  USING (
    public.can_write_trip(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  )
  WITH CHECK (
    public.can_write_trip(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  );

CREATE POLICY "Writers can delete activity_participants"
  ON public.activity_participants FOR DELETE
  USING (
    public.can_write_trip(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  );

COMMENT ON TABLE public.activity_participants IS 'Who participates in which activity; empty = all trip members by default';
