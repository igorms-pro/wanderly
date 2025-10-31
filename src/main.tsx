import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
// Initialize i18n before components render
import './lib/i18n.ts';
// Initialize Sentry and PostHog
import { initializeSentry } from './lib/sentry.ts';
import { initializePostHog } from './lib/posthog.ts';
import { initializeErrorHandling } from './lib/errorHandling.ts';
import App from './App.tsx';

// Initialize monitoring tools
initializeSentry();
initializePostHog();
initializeErrorHandling();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
