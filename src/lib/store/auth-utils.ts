import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

import type { User, Profile } from '../types/database.types';
import { supabase } from '../supabase';

export function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name || profile.email.split('@')[0],
    avatar_url:
      profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
    created_at: profile.created_at,
  };
}

export async function fetchUserFromSession(): Promise<User | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) return null;

  return profileToUser(profile);
}

export async function upsertAndBuildUser(authUser: SupabaseAuthUser): Promise<User> {
  const displayName =
    (authUser.user_metadata?.full_name as string) ||
    (authUser.user_metadata?.name as string) ||
    authUser.email?.split('@')[0] ||
    'User';
  const avatarUrl =
    (authUser.user_metadata?.avatar_url as string) ||
    (authUser.user_metadata?.picture as string) ||
    null;

  const profileRow = {
    id: authUser.id,
    email: authUser.email ?? '',
    display_name: displayName,
    avatar_url: avatarUrl,
  };

  const { error: upsertError } = await (supabase.from('profiles') as any).upsert(profileRow, {
    onConflict: 'id',
  });
  if (import.meta.env.DEV)
    console.log('[Auth] upsertAndBuildUser upsert', { ok: !upsertError, error: upsertError });
  if (upsertError && import.meta.env.DEV)
    console.warn('[Auth] Profile upsert failed:', upsertError);

  const { data: profileAfter } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profileAfter) {
    return profileToUser(profileAfter);
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    display_name: displayName,
    avatar_url: avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
    created_at: authUser.created_at ?? new Date().toISOString(),
  };
}
