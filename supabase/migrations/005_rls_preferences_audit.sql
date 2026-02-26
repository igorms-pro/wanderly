-- Migration: 005_rls_preferences_audit.sql
-- Description: Row Level Security (RLS) policies for preferences and audit_logs tables
-- Author: Issue #2 - Phase 1
-- Created: 2025-01-XX
-- Dependencies: 004_preferences_audit_logs.sql

-- ============================================================================
-- PREFERENCES RLS POLICIES
-- ============================================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON public.preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AUDIT LOGS RLS POLICIES
-- ============================================================================

-- Users can view their own audit logs
-- Note: In production, you might want to restrict this to admins only
-- For MVP, allowing users to see their own logs is useful for transparency
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert audit logs
-- This will be done via service role or triggers, not directly by users
-- But we allow it for flexibility (e.g., client-side logging)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Users cannot update audit logs (immutable)
-- No UPDATE policy = no updates allowed

-- Users cannot delete audit logs (immutable)
-- No DELETE policy = no deletes allowed

-- ============================================================================
-- HELPER FUNCTIONS (Optional - for easier preference management)
-- ============================================================================

-- Function to get a user preference by key
CREATE OR REPLACE FUNCTION public.get_user_preference(pref_key TEXT)
RETURNS JSONB AS $$
DECLARE
  pref_value JSONB;
BEGIN
  SELECT value INTO pref_value
  FROM public.preferences
  WHERE user_id = auth.uid()
    AND key = pref_key;

  RETURN pref_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set a user preference
CREATE OR REPLACE FUNCTION public.set_user_preference(pref_key TEXT, pref_value JSONB)
RETURNS UUID AS $$
DECLARE
  pref_id UUID;
BEGIN
  INSERT INTO public.preferences (user_id, key, value)
  VALUES (auth.uid(), pref_key, pref_value)
  ON CONFLICT (user_id, key)
  DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW()
  RETURNING id INTO pref_id;

  RETURN pref_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log an audit event
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action_type TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    metadata
  )
  VALUES (
    auth.uid(),
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_metadata
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
