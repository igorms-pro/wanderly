import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export type AccountBillingState = {
  ai_tier: 'free' | 'premium';
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
};

export function useAccountBilling(): {
  billing: AccountBillingState | null;
  loading: boolean;
  refreshBilling: (silent?: boolean) => Promise<void>;
} {
  const refreshUser = useStore((s) => s.refreshUser);
  const [billing, setBilling] = useState<AccountBillingState | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBilling = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) {
          setBilling(null);
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('ai_tier, stripe_subscription_id, stripe_customer_id')
          .eq('id', authUser.id)
          .single();

        if (!error && data) {
          const row = data as AccountBillingState;
          setBilling({
            ai_tier: row.ai_tier === 'premium' ? 'premium' : 'free',
            stripe_subscription_id: row.stripe_subscription_id ?? null,
            stripe_customer_id: row.stripe_customer_id ?? null,
          });
        }
        await refreshUser();
      } finally {
        setLoading(false);
      }
    },
    [refreshUser],
  );

  useEffect(() => {
    void refreshBilling();
  }, [refreshBilling]);

  return { billing, loading, refreshBilling };
}
