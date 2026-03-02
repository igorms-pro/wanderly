import type { User, Profile } from '../types/database.types';
import { supabase } from '../supabase';
import { setSentryUser, clearSentryUser } from '../sentry';
import { Analytics } from '../analytics';
import type { AppState, SetState, GetState } from './types';

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

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          clearTimeout(safetyTimeout);
          done();
          return;
        }

        if (!session?.user) {
          set({ user: null });
          clearSentryUser();
          clearTimeout(safetyTimeout);
          done();
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching profile:', profileError);
          set({ user: null });
          clearSentryUser();
          clearTimeout(safetyTimeout);
          done();
          return;
        }

        const user = profileToUser(profile);
        set({ user });
        setSentryUser({ id: user.id, email: user.email, username: user.display_name });
        Analytics.identify(user.id, { email: user.email, displayName: user.display_name });
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

          const { error: upsertError } = await (supabase.from('profiles') as any).upsert(
            profileRow,
            { onConflict: 'id' },
          );
          if (import.meta.env.DEV)
            console.log('[Auth] refreshUser upsert', { ok: !upsertError, error: upsertError });
          if (upsertError && import.meta.env.DEV)
            console.warn('[Auth] Profile upsert failed:', upsertError);

          const { data: profileAfter } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileAfter) {
            const user = profileToUser(profileAfter);
            setUserIfChanged(user);
            setSentryUser({ id: user.id, email: user.email, username: user.display_name });
            Analytics.identify(user.id, { email: user.email, displayName: user.display_name });
            if (import.meta.env.DEV) console.log('[Auth] user set (from profile after upsert)');
            return;
          }

          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email ?? '',
            display_name: displayName,
            avatar_url:
              avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
            created_at: authUser.created_at ?? new Date().toISOString(),
          };
          setUserIfChanged(fallbackUser);
          setSentryUser({
            id: fallbackUser.id,
            email: fallbackUser.email,
            username: fallbackUser.display_name,
          });
          Analytics.identify(fallbackUser.id, {
            email: fallbackUser.email,
            displayName: fallbackUser.display_name,
          });
          if (import.meta.env.DEV) console.log('[Auth] user set (fallback from auth)');
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
