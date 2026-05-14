import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles } from 'lucide-react';

import { useStripePremiumCheckout } from '@/hooks/useStripePremiumCheckout';
import { useStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AccountPage() {
  const { t } = useTranslation();
  const user = useStore((s) => s.user);
  const refreshUser = useStore((s) => s.refreshUser);
  const [params, setParams] = useSearchParams();
  const [checkoutBanner, setCheckoutBanner] = useState<'success' | 'cancelled' | null>(null);
  const { loading, error, startCheckout } = useStripePremiumCheckout();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const checkout = params.get('checkout');
    if (checkout !== 'success' && checkout !== 'cancelled') return;
    setCheckoutBanner(checkout);
    void refreshUser();
    const next = new URLSearchParams(params);
    next.delete('checkout');
    setParams(next, { replace: true });
  }, [params, refreshUser, setParams]);

  const tierLabel = user?.ai_tier === 'premium' ? t('account.planPremium') : t('account.planFree');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            {t('account.back')}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="dropdown" size="sm" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{t('account.title')}</h1>

        {checkoutBanner === 'success' ? (
          <p className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
            {t('account.checkoutSuccess')}
          </p>
        ) : null}
        {checkoutBanner === 'cancelled' ? (
          <p className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 px-4 py-3 text-sm">
            {t('account.checkoutCancelled')}
          </p>
        ) : null}

        <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" aria-hidden />
            <div className="space-y-2 min-w-0">
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                {t('account.planLabel')}
              </p>
              <p className="text-lg font-semibold">{tierLabel}</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {t('account.upgradeHint')}
              </p>
              {user?.ai_tier !== 'premium' ? (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void startCheckout()}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    {loading ? t('account.checkoutLoading') : t('account.upgradeCta')}
                  </button>
                  {error ? (
                    <p className="text-sm text-rose-600 dark:text-rose-400" role="alert">
                      {t('account.checkoutError')}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-stone-600 dark:text-stone-400 pt-1">
                  {t('account.manageHint')}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
