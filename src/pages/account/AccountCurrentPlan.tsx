import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw } from 'lucide-react';

import type { AccountBillingState } from '@/hooks/useAccountBilling';

export type AccountCurrentPlanProps = {
  billing: AccountBillingState | null;
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
};

export function AccountCurrentPlan({
  billing,
  loading,
  onRefresh,
  refreshing,
}: AccountCurrentPlanProps) {
  const { t } = useTranslation();
  const isPremium = billing?.ai_tier === 'premium';
  const hasSubId = Boolean(billing?.stripe_subscription_id);
  const pending = hasSubId && !isPremium;

  return (
    <section
      className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-4 sm:px-5"
      aria-labelledby="account-current-plan-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="account-current-plan-heading"
          className="text-sm font-medium text-stone-500 dark:text-stone-400"
        >
          {t('account.currentPlan')}
        </h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
          {t('account.refreshStatus')}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
            {t('account.planLoading')}
          </span>
        ) : (
          <>
            <span
              className={
                isPremium
                  ? 'inline-flex items-center rounded-full bg-orange-600 px-4 py-1.5 text-sm font-bold text-white'
                  : 'inline-flex items-center rounded-full bg-stone-200 dark:bg-stone-700 px-4 py-1.5 text-sm font-bold text-stone-800 dark:text-stone-100'
              }
            >
              {isPremium ? t('account.planPremium') : t('account.planFree')}
            </span>
            {isPremium ? (
              <span className="text-sm text-stone-600 dark:text-stone-400">
                {t('account.subscriptionActive')}
              </span>
            ) : null}
            {pending ? (
              <span className="text-sm text-amber-700 dark:text-amber-300">
                {t('account.activationPending')}
              </span>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
