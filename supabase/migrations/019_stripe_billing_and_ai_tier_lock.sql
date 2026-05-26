-- Stripe customer / subscription ids (written by Edge webhooks only; not by clients).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer id (cus_...); set by billing webhooks.';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe Subscription id (sub_...); set when checkout completes; cleared on cancel.';

-- Idempotency for Stripe webhook deliveries.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all stripe_webhook_events for clients"
  ON public.stripe_webhook_events FOR ALL
  USING (false)
  WITH CHECK (false);

-- Block client-side changes to ai_tier and Stripe billing columns (JWT present = end-user).
CREATE OR REPLACE FUNCTION public.profiles_enforce_billing_fields_system_only()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.ai_tier IS DISTINCT FROM OLD.ai_tier THEN
    RAISE EXCEPTION 'ai_tier is managed by billing (cannot change from client)'
      USING ERRCODE = '42501';
  END IF;
  IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id THEN
    RAISE EXCEPTION 'Stripe billing fields are managed by webhooks (cannot change from client)'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_enforce_billing_fields_system_only ON public.profiles;
CREATE TRIGGER profiles_enforce_billing_fields_system_only
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.profiles_enforce_billing_fields_system_only();
