-- Migration: 013_add_active_itinerary_to_trips.sql
-- Description: Add active_itinerary_id to trips for "single source of truth" itinerary.
-- Only owner/editor/moderator can update (existing RLS on trips UPDATE already enforces can_write_trip).

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS active_itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_trips_active_itinerary_id ON public.trips(active_itinerary_id);

COMMENT ON COLUMN public.trips.active_itinerary_id IS 'Itinerary used as the active planning timeline for this trip. NULL allowed for backward compatibility.';
