import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import { useAccountBilling } from '@/hooks/useAccountBilling';
import { useAccountPremiumSync } from '@/hooks/useAccountPremiumSync';
import { useStripePremiumCheckout } from '@/hooks/useStripePremiumCheckout';
import { useStore } from '@/lib/store';
import { DashboardHeader } from '@/pages/dashboard/DashboardHeader';
import { AccountCurrentPlan } from '@/pages/account/AccountCurrentPlan';
import { AccountPlanPicker } from '@/pages/account/AccountPlanPicker';
import { AccountPremiumManage } from '@/pages/account/AccountPremiumManage';
import { Card } from '@/components/ui/Card';

export default function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const signOut = useStore((s) => s.signOut);
  const [params, setParams] = useSearchParams();
  const [checkoutBanner, setCheckoutBanner] = useState<'success' | 'cancelled' | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { billing, loading: billingLoading, refreshBilling } = useAccountBilling();
  const { loading, error, startCheckout } = useStripePremiumCheckout();
  const { syncingPremium } = useAccountPremiumSync(checkoutBanner);

  const isPremium = billing?.ai_tier === 'premium' || user?.ai_tier === 'premium';

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/login', { replace: true });
  }, [signOut, navigate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshBilling(true);
    } finally {
      setRefreshing(false);
    }
  }, [refreshBilling]);

  useEffect(() => {
    const checkout = params.get('checkout');
    if (checkout !== 'success' && checkout !== 'cancelled') return;
    setCheckoutBanner(checkout);
    void refreshBilling();
    const next = new URLSearchParams(params);
    next.delete('checkout');
    setParams(next, { replace: true });
  }, [params, refreshBilling, setParams]);

  useEffect(() => {
    if (checkoutBanner !== 'success' || isPremium) return;
    const id = window.setInterval(() => void refreshBilling(), 3000);
    return () => window.clearInterval(id);
  }, [checkoutBanner, isPremium, refreshBilling]);

  const showSyncBanner = checkoutBanner === 'success' && (syncingPremium || !isPremium);
  const showActivatedBanner = checkoutBanner === 'success' && isPremium && !syncingPremium;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
            {t('account.title')}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{t('account.subtitle')}</p>
        </div>

        <AccountCurrentPlan
          billing={billing}
          loading={billingLoading}
          onRefresh={() => void handleRefresh()}
          refreshing={refreshing}
        />

        {showSyncBanner ? (
          <div
            className="flex gap-3 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
            role="status"
          >
            <Loader2 className="w-5 h-5 shrink-0 animate-spin text-amber-600" aria-hidden />
            <p>{t('account.checkoutSyncing')}</p>
          </div>
        ) : null}

        {showActivatedBanner ? (
          <div
            className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/25 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100"
            role="status"
          >
            {t('account.checkoutActivated')}
          </div>
        ) : null}

        {checkoutBanner === 'cancelled' ? (
          <p className="rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100/80 dark:bg-stone-900/80 px-4 py-3 text-sm text-stone-700 dark:text-stone-300">
            {t('account.checkoutCancelled')}
          </p>
        ) : null}

        {isPremium ? (
          <Card variant="default" className="p-5">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t('account.premiumActiveHint')}
            </p>
            {billing?.stripe_customer_id ? <AccountPremiumManage /> : null}
          </Card>
        ) : (
          <Card variant="default" className="p-5 sm:p-6">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-5">
              {t('account.upgradeHint')}
            </p>
            <AccountPlanPicker
              loading={loading}
              error={error}
              onSelectPlan={(cycle) => void startCheckout(cycle)}
            />
          </Card>
        )}
      </main>
    </div>
  );
}
