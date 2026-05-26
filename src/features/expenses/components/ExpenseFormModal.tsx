import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { TripMember } from '@/lib/types/database.types';

import { parseAmountToCents, validateCustomSplit } from '../lib/expenseSplits';
import type { ExpenseFormValues, ExpenseSplitMode, ExpenseWithParticipants } from '../types';

type MemberProfileLite = {
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type ExpenseFormModalProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  expense: ExpenseWithParticipants | null;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfileLite>;
  currency: string;
  currentUserId: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => Promise<void>;
};

function resolveMemberName(userId: string, profiles: Record<string, MemberProfileLite>): string {
  const profile = profiles[userId];
  return profile?.display_name || profile?.email || userId.slice(0, 8);
}

function getActiveMemberIds(members: TripMember[]): string[] {
  return members.filter((m) => !m.removed_at).map((m) => m.user_id);
}

function buildInitialForm(
  expense: ExpenseWithParticipants | null,
  memberIds: string[],
  currency: string,
  currentUserId: string,
): ExpenseFormValues {
  if (!expense) {
    return {
      title: '',
      amountCents: 0,
      currency,
      paidByUserId: memberIds.includes(currentUserId) ? currentUserId : (memberIds[0] ?? ''),
      splitMode: 'equal',
      participantUserIds: memberIds,
      customAmounts: {},
      expenseDate: '',
      notes: '',
    };
  }

  const customAmounts: Record<string, number> = {};
  for (const row of expense.participants) {
    if (row.amount_cents != null) customAmounts[row.user_id] = row.amount_cents;
  }

  return {
    title: expense.title,
    amountCents: expense.amount_cents,
    currency: expense.currency || currency,
    paidByUserId: expense.paid_by_user_id,
    splitMode: expense.split_mode,
    participantUserIds: expense.participants.map((p) => p.user_id),
    customAmounts,
    expenseDate: expense.expense_date ?? '',
    notes: expense.notes ?? '',
  };
}

export function ExpenseFormModal({
  isOpen,
  mode,
  expense,
  tripMembers,
  memberProfiles,
  currency,
  currentUserId,
  saving,
  onClose,
  onSubmit,
}: ExpenseFormModalProps) {
  const { t } = useTranslation();
  const memberIds = useMemo(() => getActiveMemberIds(tripMembers), [tripMembers]);
  const [form, setForm] = useState<ExpenseFormValues>(() =>
    buildInitialForm(expense, memberIds, currency, currentUserId),
  );
  const [amountInput, setAmountInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const initial = buildInitialForm(expense, memberIds, currency, currentUserId);
    setForm(initial);
    setAmountInput(initial.amountCents > 0 ? String(initial.amountCents / 100) : '');
    setError(null);
  }, [isOpen, expense, memberIds, currency, currentUserId]);

  if (!isOpen) return null;

  const toggleParticipant = (userId: string) => {
    setForm((prev) => {
      const selected = prev.participantUserIds.includes(userId)
        ? prev.participantUserIds.filter((id) => id !== userId)
        : [...prev.participantUserIds, userId];
      return { ...prev, participantUserIds: selected };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountCents = parseAmountToCents(amountInput);
    if (!form.title.trim()) {
      setError(t('expenses.validationTitle'));
      return;
    }
    if (amountCents == null) {
      setError(t('expenses.validationAmount'));
      return;
    }
    if (form.participantUserIds.length === 0) {
      setError(t('expenses.validationParticipants'));
      return;
    }
    if (form.splitMode === 'custom') {
      const amounts = form.participantUserIds.map((id) => form.customAmounts[id] ?? 0);
      if (!validateCustomSplit(amountCents, amounts)) {
        setError(t('expenses.validationCustomSplit'));
        return;
      }
    }

    setError(null);
    await onSubmit({ ...form, amountCents, currency });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'edit' ? t('expenses.editTitle') : t('expenses.addTitle')}
          </h2>
          <button type="button" onClick={onClose} disabled={saving} aria-label={t('common.close')}>
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {error ? (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('expenses.fieldTitle')}
            </span>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
              placeholder={t('expenses.fieldTitlePlaceholder')}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('expenses.fieldAmount', { currency })}
            </span>
            <input
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 tabular-nums"
              placeholder="0.00"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('expenses.fieldPaidBy')}
            </span>
            <select
              value={form.paidByUserId}
              onChange={(e) => setForm((prev) => ({ ...prev, paidByUserId: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
            >
              {memberIds.map((id) => (
                <option key={id} value={id}>
                  {id === currentUserId ? t('expenses.you') : resolveMemberName(id, memberProfiles)}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('expenses.fieldSplitMode')}
            </legend>
            <div className="mt-2 flex gap-3">
              {(['equal', 'custom'] as ExpenseSplitMode[]).map((modeValue) => (
                <label key={modeValue} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="splitMode"
                    checked={form.splitMode === modeValue}
                    onChange={() => setForm((prev) => ({ ...prev, splitMode: modeValue }))}
                  />
                  {modeValue === 'equal' ? t('expenses.splitEqual') : t('expenses.splitCustom')}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('expenses.fieldParticipants')}
            </legend>
            <div className="mt-2 space-y-2">
              {memberIds.map((id) => (
                <label key={id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.participantUserIds.includes(id)}
                    onChange={() => toggleParticipant(id)}
                  />
                  <span>
                    {id === currentUserId
                      ? t('expenses.you')
                      : resolveMemberName(id, memberProfiles)}
                  </span>
                  {form.splitMode === 'custom' && form.participantUserIds.includes(id) ? (
                    <input
                      inputMode="decimal"
                      value={
                        form.customAmounts[id] != null ? String(form.customAmounts[id] / 100) : ''
                      }
                      onChange={(e) => {
                        const cents = parseAmountToCents(e.target.value);
                        setForm((prev) => ({
                          ...prev,
                          customAmounts: {
                            ...prev.customAmounts,
                            [id]: cents ?? 0,
                          },
                        }));
                      }}
                      className="ml-auto w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 tabular-nums"
                      aria-label={t('expenses.customAmountFor', {
                        name: resolveMemberName(id, memberProfiles),
                      })}
                    />
                  ) : null}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {mode === 'edit' ? t('expenses.save') : t('expenses.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
