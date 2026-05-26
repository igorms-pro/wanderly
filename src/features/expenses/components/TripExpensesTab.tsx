import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Plus, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { TripMember } from '@/lib/types/database.types';

import { useTripExpenses } from '../hooks/useTripExpenses';
import type { ExpenseFormValues, ExpenseWithParticipants } from '../types';
import { ExpenseBalancesPanel } from './ExpenseBalancesPanel';
import { ExpenseFormModal } from './ExpenseFormModal';
import { ExpenseList } from './ExpenseList';

type MemberProfileLite = {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type TripExpensesTabProps = {
  tripId: string;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfileLite>;
  currency: string;
  locale: string;
  currentUserId?: string;
  canManageAny: boolean;
};

function resolveMemberName(userId: string, profiles: Record<string, MemberProfileLite>): string {
  const profile = profiles[userId];
  return profile?.display_name || profile?.email || userId.slice(0, 8);
}

export function TripExpensesTab({
  tripId,
  tripMembers,
  memberProfiles,
  currency,
  locale,
  currentUserId,
  canManageAny,
}: TripExpensesTabProps) {
  const { t } = useTranslation();
  const {
    expenses,
    balances,
    settlements,
    loading,
    error,
    saving,
    createExpense,
    updateExpense,
    removeExpense,
    refetch,
  } = useTripExpenses({ tripId });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithParticipants | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseWithParticipants | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canManageExpense = useCallback(
    (expense: ExpenseWithParticipants) =>
      canManageAny || (!!currentUserId && expense.created_by === currentUserId),
    [canManageAny, currentUserId],
  );

  const totalSpentCents = useMemo(
    () => expenses.reduce((sum, row) => sum + row.amount_cents, 0),
    [expenses],
  );

  const openCreate = () => {
    setFormMode('create');
    setSelectedExpense(null);
    setFormOpen(true);
  };

  const openEdit = (expense: ExpenseWithParticipants) => {
    setFormMode('edit');
    setSelectedExpense(expense);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    if (!currentUserId) return;
    if (formMode === 'edit' && selectedExpense) {
      await updateExpense(selectedExpense.id, values);
    } else {
      await createExpense(currentUserId, values);
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await removeExpense(expenseToDelete.id);
      setExpenseToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        {t('expenses.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('expenses.title')}
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('expenses.subtitle', { count: expenses.length })}
          </p>
        </div>
        {currentUserId ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            {t('expenses.add')}
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 flex items-start justify-between gap-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-sm font-medium text-red-700 dark:text-red-300 underline"
          >
            {t('trip.tryAgain')}
          </button>
        </div>
      ) : null}

      <ExpenseBalancesPanel
        balances={balances}
        settlements={settlements}
        memberProfiles={memberProfiles}
        currency={currency}
        locale={locale}
      />

      <ExpenseList
        expenses={expenses}
        memberProfiles={memberProfiles}
        currency={currency}
        locale={locale}
        currentUserId={currentUserId}
        canManageExpense={canManageExpense}
        onEdit={openEdit}
        onDelete={setExpenseToDelete}
      />

      {totalSpentCents > 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
          {t('expenses.totalSpent')}: {(totalSpentCents / 100).toFixed(2)} {currency}
        </p>
      ) : null}

      <ExpenseFormModal
        isOpen={formOpen}
        mode={formMode}
        expense={selectedExpense}
        tripMembers={tripMembers}
        memberProfiles={memberProfiles}
        currency={currency}
        currentUserId={currentUserId ?? ''}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {expenseToDelete ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold">{t('expenses.deleteTitle')}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('expenses.deleteMessage', {
                title: expenseToDelete.title,
                name: resolveMemberName(expenseToDelete.paid_by_user_id, memberProfiles),
              })}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {deleteLoading ? t('expenses.deleting') : t('expenses.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default TripExpensesTab;
