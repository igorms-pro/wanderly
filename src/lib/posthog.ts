import posthog from 'posthog-js';

const isPlaceholder = (s: string) =>
  !s || s.includes('your-') || s.includes('placeholder') || s.length < 10;

export const initializePostHog = () => {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key || isPlaceholder(key)) {
    if (import.meta.env.DEV && key)
      console.warn('PostHog key looks like a placeholder. Analytics disabled.');
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
