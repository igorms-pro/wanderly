-- Migration: 007_trip_constraints.sql
-- Description: Add flexible constraints field to trips table for group planning
-- Author: Issue #1 – Database Schema & Backend Setup
-- Created: 2026-02-06
-- Dependencies: 001_initial_schema.sql

-- ============================================================================
-- TRIP CONSTRAINTS (JSONB)
-- ============================================================================
-- We store trip-level planning constraints as JSONB to stay flexible:
-- - budget_per_person_cents: integer | null
-- - budget_total_cents: integer | null
-- - has_children: boolean | null
-- - pace: 'chill' | 'normal' | 'intense' | null
-- - preferences: string[] (e.g. ['nature', 'culture', 'nightlife'])
-- - must_dos: string[] (e.g. ['see whales', 'visit old town'])
-- - no_gos: string[] (e.g. ['no hiking', 'no early mornings'])
-- - any future constraints we need without schema changes
--
-- Example JSON:
-- {
--   "budget_per_person_cents": 50000,
--   "has_children": true,
--   "pace": "chill",
--   "preferences": ["nature", "food"],
--   "must_dos": ["see whales"],
--   "no_gos": ["nightclubs"]
-- }
--
-- NOTE:
-- - This keeps the schema small but expressive.
-- - We can later add computed or indexed fields if specific constraints
--   become performance-critical (e.g., a GIN index on constraints).

ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS constraints JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.trips.constraints IS
  'JSONB object with trip-level planning constraints (budget, children, pace, preferences, must-dos, no-gos, etc.)';

