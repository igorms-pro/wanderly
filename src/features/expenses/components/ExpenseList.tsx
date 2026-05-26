import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatExpenseMoney } from '../lib/formatExpenseMoney';
import type { ExpenseWithParticipants } from '../types';

type MemberProfileLite = {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type ExpenseListProps = {
  expenses: ExpenseWithParticipants[];
  memberProfiles: Record<string, MemberProfileLite>;
  currency: string;
  locale: string;
  currentUserId?: string;
  canManageExpense: (expense: ExpenseWithParticipants) => boolean;
  onEdit: (expense: ExpenseWithParticipants) => void;
  onDelete: (expense: ExpenseWithParticipants) => void;
};

function resolveMemberName(userId: string, profiles: Record<string, MemberProfileLite>): string {
  const profile = profiles[userId];
  return profile?.display_name || profile?.email || userId.slice(0, 8);
}

export function ExpenseList({
  expenses,
  memberProfiles,
  currency,
  locale,
  canManageExpense,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const { t } = useTranslation();

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-10 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('expenses.empty')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {expenses.map((expense) => {
        const canManage = canManageExpense(expense);
        const splitLabel =
          expense.split_mode === 'custom' ? t('expenses.splitCustom') : t('expenses.splitEqual');
        return (
          <li
            key={expense.id}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {expense.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('expenses.paidBy', {
                    name: resolveMemberName(expense.paid_by_user_id, memberProfiles),
                  })}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {splitLabel} · {expense.participants.length}{' '}
                  {expense.participants.length === 1
                    ? t('expenses.participantOne')
                    : t('expenses.participantOther')}
                </p>
                {expense.expense_date ? (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {expense.expense_date}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-base font-bold tabular-nums text-gray-900 dark:text-gray-100">
                  {formatExpenseMoney(expense.amount_cents, expense.currency || currency, locale)}
                </span>
                {canManage ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(expense)}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={t('expenses.editExpense')}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(expense)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={t('expenses.deleteExpense')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            {expense.notes ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                {expense.notes}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
