import { useTranslation } from 'react-i18next';
import { Check, Loader2, Sparkles } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import type { PremiumBillingCycle } from '@/hooks/useStripePremiumCheckout';

export type AccountPlanPickerProps = {
  loading: boolean;
  error: string | null;
  onSelectPlan: (cycle: PremiumBillingCycle) => void;
};

export function AccountPlanPicker({ loading, error, onSelectPlan }: AccountPlanPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600 dark:text-stone-400">{t('account.billingChoiceHint')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card variant="default" className="p-0 overflow-hidden flex flex-col">
          <div className="p-5 flex-1 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t('account.planMonthlyLabel')}
            </p>
            <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
              {t('account.planMonthlyPrice')}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300 flex-1">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                {t('account.planBenefitAi')}
              </li>
            </ul>
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelectPlan('monthly')}
              className="mt-5 w-full min-h-[44px] rounded-lg border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-900 dark:text-stone-100 hover:border-orange-400 dark:hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  {t('account.checkoutLoading')}
                </span>
              ) : (
                t('account.upgradeMonthlyCta')
              )}
            </button>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="p-0 overflow-hidden flex flex-col ring-2 ring-orange-500/40"
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {t('account.billingAnnualBadge')}
            </span>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
              {t('account.planAnnualLabel')}
            </p>
            <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
              {t('account.planAnnualPrice')}
            </p>
            <p className="text-sm text-orange-700/90 dark:text-orange-200/90 mt-1">
              {t('account.annualSavingsHint')}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300 flex-1">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                {t('account.planBenefitAi')}
              </li>
            </ul>
            <button
              type="button"
              disabled={loading}
              onClick={() => onSelectPlan('annual')}
              className="mt-5 w-full min-h-[44px] rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  {t('account.checkoutLoading')}
                </span>
              ) : (
                t('account.upgradeAnnualCta')
              )}
            </button>
          </div>
        </Card>
      </div>
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
          {t('account.checkoutError')}
        </p>
      ) : null}
      <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-500">
        <Sparkles className="w-3.5 h-3.5 text-orange-500" aria-hidden />
        {t('account.stripeSecureHint')}
      </p>
    </div>
  );
}
