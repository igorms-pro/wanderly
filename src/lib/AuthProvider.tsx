/**
 * AuthProvider — Zustand-based, same flow as OneLink.
 * The trick: ONE set() call for user + authInitialized = one render = no flash.
 */
import { useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useStore } from './store';
import type { User } from './mock-supabase';
import { createUserSession } from './sessionTracking';

function authUserToStoreUser(a: SupabaseUser): User {
  return {
    id: a.id,
    email: a.email ?? '',
    display_name:
      (a.user_metadata?.full_name as string) ||
      (a.user_metadata?.name as string) ||
      a.email?.split('@')[0] ||
      'User',
    avatar_url:
      (a.user_metadata?.avatar_url as string) ||
      (a.user_metadata?.picture as string) ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.id}`,
    created_at: a.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hasSupabaseConfig =
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!hasSupabaseConfig) {
      // No Supabase → mark ready immediately with no user
      useStore.setState({ user: null, authInitialized: true });
      return;
    }

    let mounted = true;
    let sessionInitialized = false;

    const done = (user: User | null) => {
      if (!mounted || sessionInitialized) return;
      sessionInitialized = true;
      // ONE set() = one render. user + authInitialized updated atomically.
      useStore.setState({ user, authInitialized: true });
    };

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;

      if (import.meta.env.DEV) {
        console.log('[Auth] onAuthStateChange', event, s?.user?.id ? 'session ok' : 'no session');
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        done(s?.user ? authUserToStoreUser(s.user) : null);
      }

      // For TOKEN_REFRESHED or subsequent events, just update user
      if (s?.user && sessionInitialized) {
        useStore.setState({ user: authUserToStoreUser(s.user) });
      } else if (!s?.user && sessionInitialized) {
        useStore.setState({ user: null });
      }

      // After session is set, enrich user from profile in background (non-blocking)
      if (s?.user) {
        useStore.getState().refreshUser();
      }

      if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const oauthError = url.searchParams.get('error');
        if (oauthError) {
          url.searchParams.delete('error');
          url.searchParams.delete('error_description');
          url.searchParams.delete('error_code');
          window.history.replaceState(null, '', url.toString());
          return;
        }
        if (url.hash || url.searchParams.has('code')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        if (s?.user?.id) {
          createUserSession({ userId: s.user.id }).catch((err) => {
            console.error('[Auth] Error creating session:', err);
          });
        }
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error('[Auth] Error getting session:', error);
      if (data.session?.user && !sessionInitialized) {
        useStore.setState({ user: authUserToStoreUser(data.session.user) });
      }
      setTimeout(() => {
        if (!mounted || sessionInitialized) return;
        const u = data.session?.user;
        done(u ? authUserToStoreUser(u) : null);
      }, 1000);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
