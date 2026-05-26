import { useEffect, useState } from 'react';

import { useStore } from '@/lib/store';

const POLL_MS = 2000;
const MAX_ATTEMPTS = 15;

export function useAccountPremiumSync(checkoutBanner: 'success' | 'cancelled' | null): {
  syncingPremium: boolean;
} {
  const user = useStore((s) => s.user);
  const refreshUser = useStore((s) => s.refreshUser);
  const [syncingPremium, setSyncingPremium] = useState(false);

  useEffect(() => {
    if (checkoutBanner !== 'success' || user?.ai_tier === 'premium') {
      setSyncingPremium(false);
      return;
    }

    let cancelled = false;
    let attempt = 0;
    setSyncingPremium(true);

    const poll = async (): Promise<void> => {
      if (cancelled) return;
      await refreshUser();
      attempt += 1;
      const tier = useStore.getState().user?.ai_tier;
      if (tier === 'premium' || attempt >= MAX_ATTEMPTS) {
        if (!cancelled) setSyncingPremium(false);
        return;
      }
      window.setTimeout(() => void poll(), POLL_MS);
    };

    void poll();

    return () => {
      cancelled = true;
      setSyncingPremium(false);
    };
  }, [checkoutBanner, user?.ai_tier, refreshUser]);

  return { syncingPremium };
}
