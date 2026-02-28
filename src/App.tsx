import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from './contexts/PostHogContext';
import { ToastProvider } from './contexts/ToastContext';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import { createUserSession } from './lib/sessionTracking';
import { Spinner } from './components/ui/Spinner';
import LandingPage from './pages/LandingPage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <Spinner size="lg" />
    </div>
  );
}

const DASHBOARD_HMR_EVENT = 'voyagely-dashboard-hmr';

function App() {
  const user = useStore((state) => state.user);
  const authInitialized = useStore((state) => state.authInitialized);
  const initializeAuth = useStore((state) => state.initializeAuth);
  const refreshUser = useStore((state) => state.refreshUser);
  const [dashboardKey, setDashboardKey] = useState(0);

  // HMR: when dashboard (or its deps) is updated, remount so new code is shown
  useEffect(() => {
    if (import.meta.hot) {
      const handler = () => setDashboardKey((k) => k + 1);
      window.addEventListener(DASHBOARD_HMR_EVENT, handler);
      return () => window.removeEventListener(DASHBOARD_HMR_EVENT, handler);
    }
  }, []);
  useEffect(() => {
    if (import.meta.hot) {
      import.meta.hot.accept('./pages/dashboard/index.ts', () => {
        window.dispatchEvent(new Event(DASHBOARD_HMR_EVENT));
      });
    }
  }, []);

  useEffect(() => {
    const hasSupabaseConfig =
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (import.meta.env.DEV) {
      console.log('[Auth] init', { hasSupabaseConfig });
    }

    if (!hasSupabaseConfig) {
      initializeAuth();
      return;
    }

    let mounted = true;
    let sessionInitialized = false;

    const setAuthInitialized = useStore.getState().setAuthInitialized;
    const setUser = useStore.getState().setUser;

    const done = () => {
      if (!mounted || sessionInitialized) return;
      sessionInitialized = true;
      setAuthInitialized(true);
    };

    // Same as OneLink: onAuthStateChange is the source of truth; INITIAL_SESSION / SIGNED_IN / SIGNED_OUT set loading done
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (import.meta.env.DEV) {
        console.log(
          '[Auth] onAuthStateChange',
          event,
          session?.user?.id ? 'session ok' : 'no session',
        );
      }

      // Update user state for all events (like OneLink setSession)
      if (session?.user) {
        await refreshUser();
      } else {
        setUser(null);
      }

      // Mark session as initialized when we receive INITIAL_SESSION or SIGNED_IN/SIGNED_OUT (like OneLink)
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        done();
      }

      // Clean up URL after successful sign-in (like OneLink: hash + query code)
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
        const isMagicLinkRedirect = url.hash || url.searchParams.has('code');
        if (isMagicLinkRedirect) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        if (session?.user?.id) {
          createUserSession({ userId: session.user.id }).catch((error) => {
            console.error('[Auth] Error creating session:', error);
          });
        }
      }
    });

    // Like OneLink: getSession() fallback; if INITIAL_SESSION doesn't fire within 1s, set loading false
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error && import.meta.env.DEV) {
        console.error('[Auth] Error getting session:', error);
      }
      if (data.session) {
        refreshUser();
      }
      setTimeout(() => done(), 1000);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializeAuth, refreshUser]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="voyagely-theme"
      disableTransitionOnChange={false}
    >
      <PostHogProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      !authInitialized ? (
                        <PageLoader />
                      ) : user ? (
                        <DashboardPage key={dashboardKey} />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/trip/:tripId"
                    element={
                      !authInitialized ? (
                        <PageLoader />
                      ) : user ? (
                        <TripDetailPage />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </QueryClientProvider>
        </ToastProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}

export default App;
