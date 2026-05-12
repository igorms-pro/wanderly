-- Scenario / itinerary votes (denormalized trip_id for RLS + realtime filter)

CREATE TABLE IF NOT EXISTS public.itinerary_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE ON UPDATE CASCADE,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  choice TEXT NOT NULL CHECK (choice IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (itinerary_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_itinerary_votes_trip_id ON public.itinerary_votes(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_votes_itinerary_id ON public.itinerary_votes(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_votes_user_id ON public.itinerary_votes(user_id);

ALTER TABLE public.itinerary_votes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.itinerary_votes IS 'Member votes on alternate scenarios (itineraries); trip_id denormalized for policies and realtime';

CREATE OR REPLACE FUNCTION public.itinerary_votes_validate_trip_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.itineraries i
    WHERE i.id = NEW.itinerary_id
      AND i.trip_id = NEW.trip_id
      AND i.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'itinerary_votes: itinerary must belong to trip_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_itinerary_votes_validate_trip ON public.itinerary_votes;
CREATE TRIGGER tr_itinerary_votes_validate_trip
  BEFORE INSERT OR UPDATE ON public.itinerary_votes
  FOR EACH ROW EXECUTE PROCEDURE public.itinerary_votes_validate_trip_match();

CREATE POLICY "Trip members can view itinerary votes"
  ON public.itinerary_votes FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Members can insert itinerary votes"
  ON public.itinerary_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_trip_member(trip_id, auth.uid())
  );

CREATE POLICY "Users can update own itinerary votes"
  ON public.itinerary_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators can delete itinerary votes"
  ON public.itinerary_votes FOR DELETE
  USING (
    auth.uid() = (
      SELECT owner_id FROM public.trips WHERE id = trip_id
    )
    OR public.get_trip_role(trip_id, auth.uid()) = 'moderator'
  );

ALTER PUBLICATION supabase_realtime ADD TABLE itinerary_votes;
