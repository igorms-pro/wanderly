import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatExpenseMoney } from '../lib/formatExpenseMoney';
import type { ExpenseSettlement, MemberBalance } from '../types';

type MemberProfileLite = {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type ExpenseBalancesPanelProps = {
  balances: MemberBalance[];
  settlements: ExpenseSettlement[];
  memberProfiles: Record<string, MemberProfileLite>;
  currency: string;
  locale: string;
};

function resolveMemberName(userId: string, profiles: Record<string, MemberProfileLite>): string {
  const profile = profiles[userId];
  return profile?.display_name || profile?.email || userId.slice(0, 8);
}

export function ExpenseBalancesPanel({
  balances,
  settlements,
  memberProfiles,
  currency,
  locale,
}: ExpenseBalancesPanelProps) {
  const { t } = useTranslation();
  const sortedBalances = useMemo(
    () => [...balances].sort((a, b) => b.netCents - a.netCents),
    [balances],
  );

  if (sortedBalances.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('expenses.balancesEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t('expenses.balancesTitle')}
        </h3>
        <ul className="space-y-2">
          {sortedBalances.map((row) => (
            <li key={row.userId} className="flex items-center justify-between text-sm tabular-nums">
              <span className="text-gray-700 dark:text-gray-300">
                {resolveMemberName(row.userId, memberProfiles)}
              </span>
              <span
                className={
                  row.netCents > 0
                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                    : 'text-rose-600 dark:text-rose-400 font-medium'
                }
              >
                {row.netCents > 0 ? '+' : ''}
                {formatExpenseMoney(row.netCents, currency, locale)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {settlements.length > 0 && (
        <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {t('expenses.settlementsTitle')}
          </h3>
          <ul className="space-y-2">
            {settlements.map((row) => (
              <li key={`${row.fromUserId}-${row.toUserId}-${row.amountCents}`} className="text-sm">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {resolveMemberName(row.fromUserId, memberProfiles)}
                </span>
                <span className="text-gray-600 dark:text-gray-400"> {t('expenses.owes')} </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {resolveMemberName(row.toUserId, memberProfiles)}
                </span>
                <span className="ml-1 tabular-nums text-amber-700 dark:text-amber-300 font-semibold">
                  {formatExpenseMoney(row.amountCents, currency, locale)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
