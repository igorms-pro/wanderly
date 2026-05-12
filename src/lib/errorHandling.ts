import * as Sentry from '@sentry/react';

// Check if Sentry is initialized
const isSentryInitialized = () => {
  return !!import.meta.env.VITE_SENTRY_DSN;
};

// Global error handling utilities for Sentry

export const initializeErrorHandling = () => {
  // Only set up error handlers if Sentry is initialized
  if (!isSentryInitialized()) {
    return;
  }

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    if (isSentryInitialized()) {
      Sentry.captureException(event.error || new Error(event.message), {
        tags: {
          errorType: 'javascript',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        contexts: {
          error: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      });
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isSentryInitialized()) {
      Sentry.captureException(new Error(String(event.reason)), {
        tags: {
          errorType: 'unhandledrejection',
        },
        contexts: {
          promise: {
            reason: String(event.reason),
          },
        },
      });
    }
  });

  // Handle network errors
  window.addEventListener('offline', () => {
    if (isSentryInitialized()) {
      Sentry.captureMessage('User went offline', {
        level: 'warning',
        tags: {
          errorType: 'network',
          event: 'offline',
        },
      });
    }
  });

  window.addEventListener('online', () => {
    if (isSentryInitialized()) {
      Sentry.captureMessage('User came back online', {
        level: 'info',
        tags: {
          errorType: 'network',
          event: 'online',
        },
      });
    }
  });
};

// Utility function to capture API errors
export const captureApiError = (
  error: Error | string,
  context: {
    url?: string;
    method?: string;
    statusCode?: number;
    responseData?: Record<string, string | number | boolean | null | undefined>;
    requestData?: Record<string, string | number | boolean | null | undefined>;
  } = {},
) => {
  if (!isSentryInitialized()) return;
  Sentry.captureException(typeof error === 'string' ? new Error(error) : error, {
    tags: {
      errorType: 'api',
      method: context.method,
      statusCode: context.statusCode,
    },
    contexts: {
      api: {
        url: context.url,
        method: context.method,
        statusCode: context.statusCode,
        responseData: context.responseData,
        requestData: context.requestData,
      },
    },
  });
};

// Utility function to capture user actions that might indicate issues
export const captureUserAction = (
  action: string,
  details: Record<string, string | number | boolean | null | undefined> = {},
) => {
  if (!isSentryInitialized()) return;
  Sentry.captureMessage(`User action: ${action}`, {
    level: 'info',
    tags: {
      errorType: 'userAction',
      action,
    },
    contexts: {
      userAction: {
        action,
        ...details,
      },
    },
  });
};

// Utility function to set user context
export const setUserContext = (user: { id?: string; email?: string; username?: string }) => {
  if (!isSentryInitialized()) return;
  Sentry.setUser(user);
};

// Utility function to add breadcrumb for debugging
export const addBreadcrumb = (
  message: string,
  category: string = 'default',
  data: Record<string, string | number | boolean | null | undefined> = {},
) => {
  if (!isSentryInitialized()) return;
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

export function captureFeatureError(
  error: unknown,
  feature: string,
  extra?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isSentryInitialized()) return;
  const err = error instanceof Error ? error : new Error(String(error));
  Sentry.captureException(err, {
    tags: { errorType: 'feature', feature },
    extra: extra as Record<string, unknown>,
  });
}
