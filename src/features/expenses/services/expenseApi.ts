import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseParticipant } from '@/lib/types/database.types';

import type { ExpenseFormValues, ExpenseSplitMode, ExpenseWithParticipants } from '../types';

const EXPENSE_COLUMNS =
  'id, trip_id, activity_id, title, amount_cents, currency, paid_by_user_id, split_mode, expense_date, notes, created_by, created_at, updated_at, deleted_at';

const PARTICIPANT_COLUMNS = 'id, expense_id, trip_id, user_id, amount_cents, created_at';

function buildParticipantRows(
  tripId: string,
  expenseId: string,
  splitMode: ExpenseSplitMode,
  participantUserIds: string[],
  customAmounts: Record<string, number>,
): Omit<ExpenseParticipant, 'id' | 'created_at'>[] {
  return participantUserIds.map((userId) => ({
    expense_id: expenseId,
    trip_id: tripId,
    user_id: userId,
    amount_cents: splitMode === 'custom' ? (customAmounts[userId] ?? 0) : null,
  }));
}

export async function fetchTripExpenses(tripId: string): Promise<ExpenseWithParticipants[]> {
  const { data: expensesData, error: expensesError } = await supabase
    .from('expenses')
    .select(EXPENSE_COLUMNS)
    .eq('trip_id', tripId)
    .is('deleted_at', null)
    .order('expense_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (expensesError) throw expensesError;
  const expenses = (expensesData ?? []) as Expense[];
  if (expenses.length === 0) return [];

  const expenseIds = expenses.map((e) => e.id);
  const { data: participantsData, error: participantsError } = await supabase
    .from('expense_participants')
    .select(PARTICIPANT_COLUMNS)
    .in('expense_id', expenseIds);

  if (participantsError) throw participantsError;

  const participantsByExpense = new Map<string, ExpenseParticipant[]>();
  for (const row of (participantsData ?? []) as ExpenseParticipant[]) {
    const list = participantsByExpense.get(row.expense_id) ?? [];
    list.push(row);
    participantsByExpense.set(row.expense_id, list);
  }

  return expenses.map((expense) => ({
    ...expense,
    participants: participantsByExpense.get(expense.id) ?? [],
  }));
}

export async function createTripExpense(
  tripId: string,
  userId: string,
  values: ExpenseFormValues,
): Promise<ExpenseWithParticipants> {
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      trip_id: tripId,
      title: values.title.trim(),
      amount_cents: values.amountCents,
      currency: values.currency,
      paid_by_user_id: values.paidByUserId,
      split_mode: values.splitMode,
      expense_date: values.expenseDate || null,
      notes: values.notes.trim() || null,
      created_by: userId,
    })
    .select(EXPENSE_COLUMNS)
    .single();

  if (expenseError) throw expenseError;
  if (!expense) throw new Error('Expense insert returned no row');

  const participantRows = buildParticipantRows(
    tripId,
    expense.id,
    values.splitMode,
    values.participantUserIds,
    values.customAmounts,
  );

  const { data: participants, error: participantsError } = await supabase
    .from('expense_participants')
    .insert(participantRows)
    .select(PARTICIPANT_COLUMNS);

  if (participantsError) throw participantsError;

  return {
    ...(expense as Expense),
    participants: (participants ?? []) as ExpenseParticipant[],
  };
}

export async function updateTripExpense(
  expenseId: string,
  tripId: string,
  values: ExpenseFormValues,
): Promise<ExpenseWithParticipants> {
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .update({
      title: values.title.trim(),
      amount_cents: values.amountCents,
      currency: values.currency,
      paid_by_user_id: values.paidByUserId,
      split_mode: values.splitMode,
      expense_date: values.expenseDate || null,
      notes: values.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', expenseId)
    .eq('trip_id', tripId)
    .select(EXPENSE_COLUMNS)
    .single();

  if (expenseError) throw expenseError;
  if (!expense) throw new Error('Expense update returned no row');

  const { error: deleteError } = await supabase
    .from('expense_participants')
    .delete()
    .eq('expense_id', expenseId);

  if (deleteError) throw deleteError;

  const participantRows = buildParticipantRows(
    tripId,
    expenseId,
    values.splitMode,
    values.participantUserIds,
    values.customAmounts,
  );

  const { data: participants, error: participantsError } = await supabase
    .from('expense_participants')
    .insert(participantRows)
    .select(PARTICIPANT_COLUMNS);

  if (participantsError) throw participantsError;

  return {
    ...(expense as Expense),
    participants: (participants ?? []) as ExpenseParticipant[],
  };
}

export async function deleteTripExpense(expenseId: string, tripId: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', expenseId)
    .eq('trip_id', tripId);

  if (error) throw error;
}
