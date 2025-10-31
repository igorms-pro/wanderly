import posthog from 'posthog-js';

// Analytics event properties type
type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

// Analytics event tracking utilities for Wanderly

export const Analytics = {
  // User identification
  identify: (userId: string, properties?: AnalyticsProperties) => {
    posthog.identify(userId, properties || {});
  },

  // Page views
  trackPageView: (pageName: string, properties?: AnalyticsProperties) => {
    posthog.capture('page_viewed', {
      page_name: pageName,
      ...properties,
    });
  },

  // Navigation events
  trackNavigation: (fromPage: string, toPage: string, properties?: AnalyticsProperties) => {
    posthog.capture('navigation', {
      from_page: fromPage,
      to_page: toPage,
      ...properties,
    });
  },

  // Trip events
  trackTripCreated: (tripId: string, destination: string, properties?: AnalyticsProperties) => {
    posthog.capture('trip_created', {
      trip_id: tripId,
      destination,
      ...properties,
    });
  },

  trackTripViewed: (tripId: string, properties?: AnalyticsProperties) => {
    posthog.capture('trip_viewed', {
      trip_id: tripId,
      ...properties,
    });
  },

  trackTripDeleted: (tripId: string, properties?: AnalyticsProperties) => {
    posthog.capture('trip_deleted', {
      trip_id: tripId,
      ...properties,
    });
  },

  // Itinerary events
  trackItineraryGenerated: (
    tripId: string,
    success: boolean,
    duration?: number,
    properties?: AnalyticsProperties,
  ) => {
    posthog.capture('itinerary_generated', {
      trip_id: tripId,
      success,
      duration_ms: duration,
      ...properties,
    });
  },

  trackItineraryRegenerated: (tripId: string, properties?: AnalyticsProperties) => {
    posthog.capture('itinerary_regenerated', {
      trip_id: tripId,
      ...properties,
    });
  },

  // Activity events
  trackActivityProposed: (tripId: string, activityId: string, properties?: AnalyticsProperties) => {
    posthog.capture('activity_proposed', {
      trip_id: tripId,
      activity_id: activityId,
      ...properties,
    });
  },

  trackActivityVoted: (
    tripId: string,
    activityId: string,
    vote: 'up' | 'down',
    properties?: AnalyticsProperties,
  ) => {
    posthog.capture('activity_voted', {
      trip_id: tripId,
      activity_id: activityId,
      vote,
      ...properties,
    });
  },

  trackActivityAccepted: (tripId: string, activityId: string, properties?: AnalyticsProperties) => {
    posthog.capture('activity_accepted', {
      trip_id: tripId,
      activity_id: activityId,
      ...properties,
    });
  },

  trackActivityRejected: (tripId: string, activityId: string, properties?: AnalyticsProperties) => {
    posthog.capture('activity_rejected', {
      trip_id: tripId,
      activity_id: activityId,
      ...properties,
    });
  },

  // Chat events
  trackMessageSent: (tripId: string, messageLength: number, properties?: AnalyticsProperties) => {
    posthog.capture('message_sent', {
      trip_id: tripId,
      message_length: messageLength,
      ...properties,
    });
  },

  // Collaboration events
  trackMemberInvited: (tripId: string, role: string, properties?: AnalyticsProperties) => {
    posthog.capture('member_invited', {
      trip_id: tripId,
      role,
      ...properties,
    });
  },

  trackMemberJoined: (tripId: string, properties?: AnalyticsProperties) => {
    posthog.capture('member_joined', {
      trip_id: tripId,
      ...properties,
    });
  },

  // Theme events
  trackThemeChange: (fromTheme: string, toTheme: string, properties?: AnalyticsProperties) => {
    posthog.capture('theme_changed', {
      from_theme: fromTheme,
      to_theme: toTheme,
      ...properties,
    });
  },

  // Language events
  trackLanguageChange: (fromLang: string, toLang: string, properties?: AnalyticsProperties) => {
    posthog.capture('language_changed', {
      from_language: fromLang,
      to_language: toLang,
      ...properties,
    });
  },

  // Feature usage events
  trackFeatureUsage: (featureName: string, action: string, properties?: AnalyticsProperties) => {
    posthog.capture('feature_used', {
      feature_name: featureName,
      action,
      ...properties,
    });
  },

  // Error tracking
  trackError: (error: string, context: string, properties?: AnalyticsProperties) => {
    posthog.capture('error_occurred', {
      error,
      context,
      ...properties,
    });
  },

  // Custom events
  capture: (eventName: string, properties?: AnalyticsProperties) => {
    posthog.capture(eventName, properties);
  },

  // Feature flags
  getFeatureFlag: (flagKey: string) => {
    return posthog.getFeatureFlag(flagKey);
  },

  isFeatureEnabled: (flagKey: string) => {
    return posthog.isFeatureEnabled(flagKey);
  },
};
