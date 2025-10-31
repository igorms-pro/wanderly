import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from './contexts/PostHogContext';
import { useStore } from './lib/store';
import { mockSupabase } from './lib/mock-supabase';
import { setSentryUser, clearSentryUser } from './lib/sentry';
import { Analytics } from './lib/analytics';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TripDetailPage from './pages/TripDetailPage';

const queryClient = new QueryClient();

function App() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = mockSupabase.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Set user context for Sentry and PostHog
      setSentryUser({
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.displayName,
      });
      Analytics.identify(currentUser.id, {
        email: currentUser.email,
        displayName: currentUser.displayName,
      });
    } else {
      clearSentryUser();
    }

    // Create demo user if not exists
    const users = JSON.parse(localStorage.getItem('wanderly_users') || '[]');
    if (users.length === 0) {
      // Create demo user
      mockSupabase.signUp('demo@wanderly.com', 'demo123', 'Demo User').catch(() => {
        // User might already exist
      });
    }
  }, [setUser]);

  return (
    <PostHogProvider>
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
    </PostHogProvider>
  );
}

export default App;
