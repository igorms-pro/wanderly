import type { User } from '../types/database.types';
import { supabase } from '../supabase';
import { setSentryUser, clearSentryUser } from '../sentry';
import { Analytics } from '../analytics';
import type { AppState, SetState, GetState } from './types';
import { profileToUser, fetchUserFromSession, upsertAndBuildUser } from './auth-utils';

export { profileToUser };

export function createAuthSlice(set: SetState, get: GetState): Partial<AppState> {
  return {
    user: null,
    setUser: (user) => set({ user }),
    authInitialized: false,
    setAuthInitialized: (v) => set({ authInitialized: v }),

    initializeAuth: async () => {
      const done = () => set({ authInitialized: true });
      const safetyTimeout = setTimeout(done, 5000);

      try {
        const hasSupabaseConfig =
          import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!hasSupabaseConfig) {
          clearTimeout(safetyTimeout);
          set({ user: null });
          done();
          return;
        }

        const user = await fetchUserFromSession();
        if (!user) {
          set({ user: null });
          clearSentryUser();
        } else {
          set({ user });
          setSentryUser({ id: user.id, email: user.email, username: user.display_name });
          Analytics.identify(user.id, { email: user.email, displayName: user.display_name });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        set({ user: null });
        clearSentryUser();
      } finally {
        clearTimeout(safetyTimeout);
        done();
      }
    },

    signInWithOAuth: async (provider: 'google' | 'facebook') => {
      try {
        const hasSupabaseConfig =
          import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!hasSupabaseConfig) return { error: 'Auth is not configured.' };
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
          },
        });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('cancelled') || msg.includes('denied'))
            return { error: 'Sign in was cancelled.' };
          return { error: error.message };
        }
        return {};
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' };
      }
    },

    signInWithMagicLink: async (email: string) => {
      try {
        const hasSupabaseConfig =
          import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!hasSupabaseConfig) return { error: 'Auth is not configured.' };
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${origin}/dashboard` },
        });
        if (error) return { error: error.message };
        return {};
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Failed to send link.' };
      }
    },

    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error);
          throw error;
        }
        set({
          user: null,
          trips: [],
          currentTrip: null,
          activities: [],
          votes: {},
          messages: [],
        });
        clearSentryUser();
      } catch (error) {
        console.error('Error during sign out:', error);
        throw error;
      }
    },

    refreshUser: async () => {
      if (import.meta.env.DEV) console.log('[Auth] refreshUser() start');

      const setUserIfChanged = (newUser: User) => {
        const current = get().user;
        if (
          current &&
          current.id === newUser.id &&
          current.email === newUser.email &&
          current.display_name === newUser.display_name &&
          current.avatar_url === newUser.avatar_url
        )
          return;
        set({ user: newUser });
      };

      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (import.meta.env.DEV)
          console.log('[Auth] refreshUser getUser()', {
            hasUser: !!authUser,
            error: authError?.message,
          });

        if (authError || !authUser) {
          if (import.meta.env.DEV) console.log('[Auth] refreshUser → set user null (no auth user)');
          set({ user: null });
          clearSentryUser();
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (import.meta.env.DEV)
          console.log('[Auth] refreshUser profile fetch', {
            hasProfile: !!profile,
            error: profileError?.code ?? profileError?.message,
          });

        if (profileError || !profile) {
          if (import.meta.env.DEV)
            console.log('[Auth] refreshUser no profile → upsert then refetch');
          const user = await upsertAndBuildUser(authUser);
          setUserIfChanged(user);
          setSentryUser({ id: user.id, email: user.email, username: user.display_name });
          Analytics.identify(user.id, { email: user.email, displayName: user.display_name });
          if (import.meta.env.DEV) console.log('[Auth] user set (from upsert)');
          return;
        }

        const user = profileToUser(profile);
        setUserIfChanged(user);
        if (import.meta.env.DEV) console.log('[Auth] user set (from profile)');
        setSentryUser({ id: user.id, email: user.email, username: user.display_name });
        Analytics.identify(user.id, { email: user.email, displayName: user.display_name });
      } catch (error) {
        console.error('[Auth] refreshUser error:', error);
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          set({ user: null });
          clearSentryUser();
        }
      }
    },
  };
}
