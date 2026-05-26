import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';
// Initialize i18n before components render
import './lib/i18n.ts';
// Initialize Sentry and PostHog
import { initializeSentry } from './lib/sentry.ts';
import { initializePostHog } from './lib/posthog.ts';
import { initializeErrorHandling } from './lib/errorHandling.ts';
import { registerPwaServiceWorker } from './lib/pwa/registerPwa.ts';
import App from './App.tsx';

// Initialize monitoring tools
initializeSentry();
initializePostHog();
initializeErrorHandling();
registerPwaServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
