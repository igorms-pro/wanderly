-- Trip templates, sharing links, timezone — doc #16 / GitHub #54

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS default_role TEXT NOT NULL DEFAULT 'viewer'
  CHECK (default_role IN ('editor', 'viewer', 'moderator'));

CREATE TABLE IF NOT EXISTS public.trip_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  source_trip_id UUID REFERENCES public.trips (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  destination_text TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_templates_owner_id ON public.trip_templates (owner_id);
CREATE INDEX IF NOT EXISTS idx_trip_templates_public ON public.trip_templates (is_public)
  WHERE is_public = true;

ALTER TABLE public.trip_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their templates"
  ON public.trip_templates FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Anyone can view public templates"
  ON public.trip_templates FOR SELECT
  USING (is_public = true);

CREATE OR REPLACE FUNCTION public.get_invitation_preview(p_invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation public.invitations%ROWTYPE;
  v_trip public.trips%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation
  FROM public.invitations
  WHERE invite_code = p_invite_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF v_invitation.expires_at IS NOT NULL AND v_invitation.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'expired');
  END IF;

  IF v_invitation.max_uses IS NOT NULL AND v_invitation.used_count >= v_invitation.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'exhausted');
  END IF;

  SELECT * INTO v_trip
  FROM public.trips
  WHERE id = v_invitation.trip_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'trip_unavailable');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'trip_id', v_trip.id,
    'trip_title', v_trip.title,
    'destination_text', v_trip.destination_text,
    'default_role', v_invitation.default_role,
    'expires_at', v_invitation.expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_trip_invitation(p_invite_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation public.invitations%ROWTYPE;
  v_user_id UUID := auth.uid();
  v_existing UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_invitation
  FROM public.invitations
  WHERE invite_code = p_invite_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invitation_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_invitation.expires_at IS NOT NULL AND v_invitation.expires_at < now() THEN
    RAISE EXCEPTION 'invitation_expired' USING ERRCODE = 'P0001';
  END IF;

  IF v_invitation.max_uses IS NOT NULL AND v_invitation.used_count >= v_invitation.max_uses THEN
    RAISE EXCEPTION 'invitation_exhausted' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.trips WHERE id = v_invitation.trip_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'trip_unavailable' USING ERRCODE = 'P0001';
  END IF;

  SELECT user_id INTO v_existing
  FROM public.trip_members
  WHERE trip_id = v_invitation.trip_id
    AND user_id = v_user_id
    AND removed_at IS NULL;

  IF FOUND THEN
    RETURN jsonb_build_object('trip_id', v_invitation.trip_id, 'already_member', true);
  END IF;

  INSERT INTO public.trip_members (trip_id, user_id, role, invited_by)
  VALUES (
    v_invitation.trip_id,
    v_user_id,
    v_invitation.default_role,
    v_invitation.inviter_id
  );

  UPDATE public.invitations
  SET used_count = used_count + 1
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object('trip_id', v_invitation.trip_id, 'already_member', false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_preview(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_trip_invitation(TEXT) TO authenticated;
