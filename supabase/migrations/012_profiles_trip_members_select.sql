-- Allow reading profiles of users who are in the same trip(s) as the current user.
-- Required so itinerary participants list can show display_name/avatar for co-members.
CREATE POLICY "Users can view profiles of trip co-members"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM public.trip_members tm1
      JOIN public.trip_members tm2 ON tm1.trip_id = tm2.trip_id AND tm2.removed_at IS NULL
      WHERE tm1.user_id = profiles.id
        AND tm2.user_id = auth.uid()
        AND tm1.removed_at IS NULL
    )
  );
