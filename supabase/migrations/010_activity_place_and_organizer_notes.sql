-- Migration: 010_activity_place_and_organizer_notes.sql
-- Description: Lieu (place_name pour affichage + Google Maps), notes organisateur, transport limité à 6 valeurs
-- Dependencies: 001_initial_schema.sql, 009_activity_planning_fields.sql

-- ============================================================================
-- ACTIVITIES: nom du lieu (affichage + lien Google Maps)
-- ============================================================================
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS place_name TEXT;

COMMENT ON COLUMN public.activities.place_name IS 'Display name or address for the place; used with lat/lon or place_id for Google Maps link';

-- ============================================================================
-- ACTIVITIES: note de l'organisateur (ex: "N'oubliez pas vos tongs")
-- ============================================================================
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS organizer_notes TEXT;

COMMENT ON COLUMN public.activities.organizer_notes IS 'Optional message from organizer to participants (e.g. what to bring, reminder)';

-- ============================================================================
-- ACTIVITIES: transport_type limité à 6 valeurs (car, taxi, walking, bus, metro, plane)
-- ============================================================================
-- Remplacer les anciennes valeurs éventuelles (foot -> walking, train -> bus)
UPDATE public.activities SET transport_type = 'walking' WHERE transport_type IN ('foot', 'on_foot');
UPDATE public.activities SET transport_type = 'bus' WHERE transport_type = 'train';

ALTER TABLE public.activities
  DROP CONSTRAINT IF EXISTS valid_transport_type;

ALTER TABLE public.activities
  ADD CONSTRAINT valid_transport_type CHECK (
    transport_type IS NULL OR transport_type IN ('car', 'taxi', 'walking', 'bus', 'metro', 'plane')
  );

COMMENT ON COLUMN public.activities.transport_type IS 'One of: car, taxi, walking, bus, metro, plane';
