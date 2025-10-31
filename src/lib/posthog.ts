import posthog from 'posthog-js';

export const initializePostHog = () => {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) {
    console.warn('PostHog key not found. Analytics will be disabled.');
    return;
  }

  posthog.init(key, {
    api_host: host,
    // Enable session replay
    loaded: (posthog) => {
      if (import.meta.env.DEV) console.log('PostHog loaded');
    },
    // Capture pageviews automatically
    capture_pageview: true,
    // Capture pageleave automatically
    capture_pageleave: true,
  });
};

export default posthog;
