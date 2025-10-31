import { useCallback } from 'react';
import * as Sentry from '@sentry/react';
import {
  captureApiError,
  captureUserAction,
  setUserContext,
  addBreadcrumb,
} from '../lib/errorHandling';

// Type for error context
type ErrorContext = Record<string, string | number | boolean | null | undefined>;

export const useErrorTracking = () => {
  // Capture exceptions
  const captureException = useCallback((error: Error, context?: ErrorContext) => {
    Sentry.captureException(error, {
      contexts: {
        custom: context || {},
      },
    });
  }, []);

  // Capture messages
  const captureMessage = useCallback(
    (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
      Sentry.captureMessage(message, { level });
    },
    [],
  );

  // Capture API errors
  const captureApiErrorWithContext = useCallback(
    (
      error: Error | string,
      context: {
        url?: string;
        method?: string;
        statusCode?: number;
        responseData?: ErrorContext;
        requestData?: ErrorContext;
      } = {},
    ) => {
      captureApiError(error, context);
    },
    [],
  );

  // Capture user actions
  const captureUserActionWithDetails = useCallback((action: string, details: ErrorContext = {}) => {
    captureUserAction(action, details);
  }, []);

  // Set user context
  const setUserContextWithData = useCallback(
    (user: { id?: string; email?: string; username?: string }) => {
      setUserContext(user);
    },
    [],
  );

  // Add breadcrumb
  const addBreadcrumbWithData = useCallback(
    (message: string, category: string = 'default', data: ErrorContext = {}) => {
      addBreadcrumb(message, category, data);
    },
    [],
  );

  // Capture trip-related errors
  const captureTripError = useCallback(
    (error: Error, tripId: string, action: string) => {
      Sentry.captureException(error, {
        tags: {
          errorType: 'trip',
          action,
        },
        contexts: {
          trip: {
            tripId,
            action,
            error: error.message,
          },
        },
      });
    },
    [],
  );

  // Capture itinerary generation errors
  const captureItineraryError = useCallback(
    (
      error: Error,
      context: {
        tripId: string;
        destination?: string;
        duration?: number;
      },
    ) => {
      Sentry.captureException(error, {
        tags: {
          errorType: 'itinerary',
          tripId: context.tripId,
        },
        contexts: {
          itinerary: {
            tripId: context.tripId,
            destination: context.destination,
            duration: context.duration,
            error: error.message,
          },
        },
      });
    },
    [],
  );

  return {
    captureException,
    captureMessage,
    captureApiError: captureApiErrorWithContext,
    captureUserAction: captureUserActionWithDetails,
    setUserContext: setUserContextWithData,
    addBreadcrumb: addBreadcrumbWithData,
    captureTripError,
    captureItineraryError,
  };
};
