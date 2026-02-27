import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
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
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  const user = useStore((state) => state.user);
  const authInitialized = useStore((state) => state.authInitialized);
  const initializeAuth = useStore((state) => state.initializeAuth);
  const refreshUser = useStore((state) => state.refreshUser);

  useEffect(() => {
    // Only initialize auth if Supabase is configured
    // In CI/test environments without env vars, skip auth initialization
    const hasSupabaseConfig =
      import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabaseConfig) {
      // Initialize auth on mount - check existing session and load profile
      initializeAuth();

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            const hasCode = url.searchParams.has('code');
            const hasToken = url.searchParams.has('token');
            const hasType = url.searchParams.has('type');
            if (hasCode || hasToken || hasType || url.hash) {
              url.searchParams.delete('code');
              url.searchParams.delete('token');
              url.searchParams.delete('type');
              url.searchParams.delete('redirect_to');
              window.history.replaceState({}, document.title, url.pathname + url.search);
            }

            // Track user session (similar to OneLink)
            if (session?.user?.id) {
              createUserSession({ userId: session.user.id }).catch((error) => {
                console.error('Error creating user session:', error);
              });
            }
          }
          // User signed in or token refreshed, refresh user profile
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          // User signed out, refresh will clear the user state
          await refreshUser();
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
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
                        <DashboardPage />
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
