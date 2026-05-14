import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';

const CHECKOUT_BODY = {
  successPath: '/account?checkout=success',
  cancelPath: '/account?checkout=cancelled',
};

export function useStripePremiumCheckout(): {
  loading: boolean;
  error: string | null;
  startCheckout: () => Promise<void>;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout-session', {
        body: CHECKOUT_BODY,
      });
      if (fnError) {
        setError(fnError.message || 'checkout_failed');
        return;
      }
      const url = (data as { url?: string })?.url;
      if (!url) {
        setError('checkout_failed');
        return;
      }
      window.location.assign(url);
    } catch {
      setError('checkout_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, startCheckout };
}
