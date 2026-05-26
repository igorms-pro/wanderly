-- Trip group expenses (Tricount-like) — doc #14 / GitHub #50

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  paid_by_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  split_mode TEXT NOT NULL DEFAULT 'equal' CHECK (split_mode IN ('equal', 'custom')),
  expense_date DATE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses (trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses (paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses (trip_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.expenses (id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  amount_cents INTEGER CHECK (amount_cents IS NULL OR amount_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT expense_participants_unique_user UNIQUE (expense_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_participants_expense_id
  ON public.expense_participants (expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_trip_id
  ON public.expense_participants (trip_id);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view expenses"
  ON public.expenses FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Trip members can create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND public.is_trip_member(trip_id, auth.uid())
    AND public.is_trip_member(trip_id, paid_by_user_id)
  );

CREATE POLICY "Creators and admins can update expenses"
  ON public.expenses FOR UPDATE
  USING (
    public.is_trip_member(trip_id, auth.uid())
    AND (
      auth.uid() = created_by
      OR public.can_write_trip(trip_id, auth.uid())
    )
  )
  WITH CHECK (
    public.is_trip_member(trip_id, auth.uid())
    AND public.is_trip_member(trip_id, paid_by_user_id)
  );

CREATE POLICY "Creators and admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (
    public.is_trip_member(trip_id, auth.uid())
    AND (
      auth.uid() = created_by
      OR public.can_write_trip(trip_id, auth.uid())
    )
  );

CREATE POLICY "Trip members can view expense participants"
  ON public.expense_participants FOR SELECT
  USING (public.is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Trip members can add expense participants"
  ON public.expense_participants FOR INSERT
  WITH CHECK (
    public.is_trip_member(trip_id, auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_id
        AND e.trip_id = expense_participants.trip_id
        AND e.deleted_at IS NULL
        AND (
          e.created_by = auth.uid()
          OR public.can_write_trip(e.trip_id, auth.uid())
        )
    )
  );

CREATE POLICY "Trip members can update expense participants"
  ON public.expense_participants FOR UPDATE
  USING (
    public.is_trip_member(trip_id, auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_id
        AND e.trip_id = expense_participants.trip_id
        AND (
          e.created_by = auth.uid()
          OR public.can_write_trip(e.trip_id, auth.uid())
        )
    )
  )
  WITH CHECK (public.is_trip_member(trip_id, auth.uid()));

CREATE POLICY "Trip members can remove expense participants"
  ON public.expense_participants FOR DELETE
  USING (
    public.is_trip_member(trip_id, auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_id
        AND e.trip_id = expense_participants.trip_id
        AND (
          e.created_by = auth.uid()
          OR public.can_write_trip(e.trip_id, auth.uid())
        )
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_participants;
