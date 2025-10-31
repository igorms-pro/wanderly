import { usePostHog as usePostHogHook } from 'posthog-js/react';
import { Analytics } from '../lib/analytics';

export const usePostHog = () => {
  const posthog = usePostHogHook();

  return {
    posthog,
    analytics: Analytics,
    // Convenience methods
    identify: Analytics.identify,
    trackPageView: Analytics.trackPageView,
    trackNavigation: Analytics.trackNavigation,
    trackTripCreated: Analytics.trackTripCreated,
    trackTripViewed: Analytics.trackTripViewed,
    trackTripDeleted: Analytics.trackTripDeleted,
    trackItineraryGenerated: Analytics.trackItineraryGenerated,
    trackItineraryRegenerated: Analytics.trackItineraryRegenerated,
    trackActivityProposed: Analytics.trackActivityProposed,
    trackActivityVoted: Analytics.trackActivityVoted,
    trackActivityAccepted: Analytics.trackActivityAccepted,
    trackActivityRejected: Analytics.trackActivityRejected,
    trackMessageSent: Analytics.trackMessageSent,
    trackMemberInvited: Analytics.trackMemberInvited,
    trackMemberJoined: Analytics.trackMemberJoined,
    trackThemeChange: Analytics.trackThemeChange,
    trackLanguageChange: Analytics.trackLanguageChange,
    trackFeatureUsage: Analytics.trackFeatureUsage,
    trackError: Analytics.trackError,
    capture: Analytics.capture,
    getFeatureFlag: Analytics.getFeatureFlag,
    isFeatureEnabled: Analytics.isFeatureEnabled,
  };
};
