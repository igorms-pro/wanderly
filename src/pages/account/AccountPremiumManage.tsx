import { useTranslation } from 'react-i18next';
import { ExternalLink, Loader2 } from 'lucide-react';

import { useStripeBillingPortal } from '@/hooks/useStripeBillingPortal';

export function AccountPremiumManage() {
  const { t } = useTranslation();
  const { loading, error, openPortal } = useStripeBillingPortal();

  return (
    <div className="mt-4 border-t border-stone-200 dark:border-stone-700 pt-4 space-y-3">
      <p className="text-sm text-stone-600 dark:text-stone-400">{t('account.manageHint')}</p>
      <button
        type="button"
        disabled={loading}
        onClick={() => void openPortal()}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-900 dark:text-stone-100 hover:border-orange-400 dark:hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
        ) : (
          <ExternalLink className="w-4 h-4" aria-hidden />
        )}
        {loading ? t('account.portalLoading') : t('account.manageSubscriptionCta')}
      </button>
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
          {t('account.portalError')}
        </p>
      ) : null}
    </div>
  );
}
