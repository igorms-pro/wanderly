import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from './contexts/PostHogContext';
import { ToastProvider } from './contexts/ToastContext';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailPage from './pages/TripDetailPage';

const queryClient = new QueryClient();

function App() {
  const user = useStore((state) => state.user);
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
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/dashboard"
                  element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
                />
                <Route
                  path="/trip/:tripId"
                  element={user ? <TripDetailPage /> : <Navigate to="/login" replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </QueryClientProvider>
        </ToastProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}

export default App;
