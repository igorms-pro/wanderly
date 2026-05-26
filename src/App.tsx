import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { PostHogProvider } from './contexts/PostHogContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './lib/AuthProvider';
import { useStore } from './lib/store';
import { Spinner } from './components/ui/Spinner';
import LandingPage from './pages/LandingPage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <Spinner size="lg" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  const authInitialized = useStore((s) => s.authInitialized);
  if (!authInitialized) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const [dashboardKey, setDashboardKey] = useState(0);

  useEffect(() => {
    if (!import.meta.hot) return;
    const handler = () => setDashboardKey((k) => k + 1);
    window.addEventListener('voyagely-dashboard-hmr', handler);
    return () => window.removeEventListener('voyagely-dashboard-hmr', handler);
  }, []);
  useEffect(() => {
    if (!import.meta.hot) return;
    import.meta.hot.accept('./pages/dashboard/index.ts', () => {
      window.dispatchEvent(new Event('voyagely-dashboard-hmr'));
    });
  }, []);

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
          <AuthProvider>
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
                        <ProtectedRoute>
                          <DashboardPage key={dashboardKey} />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/trip/:tripId"
                      element={
                        <ProtectedRoute>
                          <TripDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </QueryClientProvider>
          </AuthProvider>
        </ToastProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}

export default App;
