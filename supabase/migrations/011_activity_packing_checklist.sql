-- Migration: 011_activity_packing_checklist.sql
-- Description: Checklist \"à apporter\" par activité (maillot, eau, chaussures, etc.)
-- Dependencies: 001_initial_schema.sql, 009_activity_planning_fields.sql, 010_activity_place_and_organizer_notes.sql

-- ============================================================================
-- ACTIVITIES: packing_checklist (JSONB)
-- ============================================================================
-- Format simple recommandé :
--   ['Maillot de bain', 'Crème solaire', 'Chaussures de rando']
-- On laisse la structure souple (JSONB) pour pouvoir évoluer plus tard.

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS packing_checklist JSONB;

COMMENT ON COLUMN public.activities.packing_checklist IS
  'JSONB checklist of items to bring for the activity (e.g. [\"Maillot de bain\", \"Eau 1L\", \"Chaussures de rando\"])';

