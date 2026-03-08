-- Persist display order of activities within an itinerary day (for drag-and-drop reorder).
-- Lower value = earlier in the list. NULL = legacy row (sort by start_time then created_at).
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS order_index INTEGER;

COMMENT ON COLUMN public.activities.order_index IS 'Display order within itinerary_day_id (0 = first). Used for drag-and-drop; NULL falls back to start_time, created_at.';

CREATE INDEX IF NOT EXISTS idx_activities_day_order ON public.activities(itinerary_day_id, order_index NULLS LAST);
