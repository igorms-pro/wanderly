-- Allow any trip member to add or remove themselves from activity_participants (self-service).
-- Existing policies allow only writers to insert/delete; these add member self-service.

CREATE POLICY "Trip members can add themselves as participant"
  ON public.activity_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_trip_member(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  );

CREATE POLICY "Trip members can remove themselves as participant"
  ON public.activity_participants FOR DELETE
  USING (
    auth.uid() = user_id
    AND public.is_trip_member(
      (SELECT trip_id FROM public.activities WHERE id = activity_id),
      auth.uid()
    )
  );
