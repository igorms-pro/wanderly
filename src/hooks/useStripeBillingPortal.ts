import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';

export function useStripeBillingPortal(): {
  loading: boolean;
  error: string | null;
  openPortal: () => Promise<void>;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'create-billing-portal-session',
        { body: {} },
      );
      if (fnError) {
        setError(fnError.message || 'portal_failed');
        return;
      }
      const url = (data as { url?: string })?.url;
      if (!url) {
        setError('portal_failed');
        return;
      }
      window.location.assign(url);
    } catch {
      setError('portal_failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, openPortal };
}
