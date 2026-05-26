import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';

import { computeMemberBalances, simplifySettlements } from '../lib/expenseSplits';
import {
  createTripExpense,
  deleteTripExpense,
  fetchTripExpenses,
  updateTripExpense,
} from '../services/expenseApi';
import type {
  ExpenseFormValues,
  ExpenseSettlement,
  ExpenseWithParticipants,
  MemberBalance,
} from '../types';

type UseTripExpensesOptions = {
  tripId: string;
  enabled?: boolean;
};

type UseTripExpensesResult = {
  expenses: ExpenseWithParticipants[];
  balances: MemberBalance[];
  settlements: ExpenseSettlement[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  refetch: () => Promise<void>;
  createExpense: (userId: string, values: ExpenseFormValues) => Promise<void>;
  updateExpense: (expenseId: string, values: ExpenseFormValues) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
};

export function useTripExpenses({
  tripId,
  enabled = true,
}: UseTripExpensesOptions): UseTripExpensesResult {
  const [expenses, setExpenses] = useState<ExpenseWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refetch = useCallback(async () => {
    if (!tripId) return;
    setError(null);
    try {
      const rows = await fetchTripExpenses(tripId);
      setExpenses(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!enabled || !tripId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void refetch();
  }, [enabled, tripId, refetch]);

  useEffect(() => {
    if (!enabled || !tripId) return;

    const channel = supabase
      .channel(`trip:${tripId}:expenses`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${tripId}` },
        () => {
          void refetch();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expense_participants',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void refetch();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, tripId, refetch]);

  const balances = useMemo(() => computeMemberBalances(expenses), [expenses]);
  const settlements = useMemo(() => simplifySettlements(balances), [balances]);

  const createExpense = useCallback(
    async (userId: string, values: ExpenseFormValues) => {
      setSaving(true);
      setError(null);
      try {
        const created = await createTripExpense(tripId, userId, values);
        setExpenses((prev) => [created, ...prev]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create expense';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [tripId],
  );

  const updateExpense = useCallback(
    async (expenseId: string, values: ExpenseFormValues) => {
      setSaving(true);
      setError(null);
      try {
        const updated = await updateTripExpense(expenseId, tripId, values);
        setExpenses((prev) => prev.map((row) => (row.id === expenseId ? updated : row)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update expense';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [tripId],
  );

  const removeExpense = useCallback(
    async (expenseId: string) => {
      setSaving(true);
      setError(null);
      try {
        await deleteTripExpense(expenseId, tripId);
        setExpenses((prev) => prev.filter((row) => row.id !== expenseId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete expense';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [tripId],
  );

  return {
    expenses,
    balances,
    settlements,
    loading,
    error,
    saving,
    refetch,
    createExpense,
    updateExpense,
    removeExpense,
  };
}
