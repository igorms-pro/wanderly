import * as Sentry from '@sentry/react';

export const initializeSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;

  if (!dsn) {
    console.warn('Sentry DSN not found. Error tracking will be disabled.');
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

export const setSentryUser = (user: {
  id?: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

export const clearSentryUser = () => {
  Sentry.setUser(null);
};
