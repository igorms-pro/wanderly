import * as Sentry from '@sentry/react';

const isPlaceholderDsn = (s: string) =>
  !s || s.includes('your-') || s.includes('placeholder') || s.length < 20;

export const initializeSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;

  if (!dsn || isPlaceholderDsn(dsn)) {
    if (import.meta.env.DEV && dsn)
      console.warn('Sentry DSN looks like a placeholder. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Before send hook to filter sensitive data
    beforeSend(event, hint) {
      // Filter out development errors
      if (environment === 'development' && event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = String(error.message);
          // Suppress known development-only errors
          if (
            errorMessage.includes('ResizeObserver') ||
            errorMessage.includes('Non-Error promise rejection')
          ) {
            return null;
          }
        }
      }
      return event;
    },

    // Debug mode
    debug: environment === 'development',
  });
};

export const setSentryUser = (user: { id?: string; email?: string; username?: string }) => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  Sentry.setUser(user);
};

export const clearSentryUser = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  Sentry.setUser(null);
};
