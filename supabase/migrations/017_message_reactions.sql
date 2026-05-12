-- Message reactions (simple emoji bar per message; trip-scoped for RLS + Realtime)

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT message_reactions_emoji_allowed CHECK (emoji IN ('👍', '👎', '❤️', '😂')),
  CONSTRAINT message_reactions_one_per_user_emoji UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_trip_id ON public.message_reactions (trip_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions (message_id);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view message reactions"
  ON public.message_reactions FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Trip members can add own message reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_trip_member(trip_id, auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.messages m
      WHERE m.id = message_id
        AND m.trip_id = message_reactions.trip_id
        AND m.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can remove own message reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id AND public.is_trip_member(trip_id, auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
