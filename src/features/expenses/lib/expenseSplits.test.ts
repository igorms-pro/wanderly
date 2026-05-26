import { describe, expect, it } from 'vitest';

import type { ExpenseWithParticipants } from '../types';
import {
  computeMemberBalances,
  parseAmountToCents,
  simplifySettlements,
  splitEqualAmount,
  validateCustomSplit,
} from './expenseSplits';

const baseExpense = (overrides: Partial<ExpenseWithParticipants>): ExpenseWithParticipants => ({
  id: 'exp-1',
  trip_id: 'trip-1',
  activity_id: null,
  title: 'Dinner',
  amount_cents: 10000,
  currency: 'EUR',
  paid_by_user_id: 'alice',
  split_mode: 'equal',
  expense_date: null,
  notes: null,
  created_by: 'alice',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
  participants: [
    {
      id: 'p1',
      expense_id: 'exp-1',
      trip_id: 'trip-1',
      user_id: 'alice',
      amount_cents: null,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'p2',
      expense_id: 'exp-1',
      trip_id: 'trip-1',
      user_id: 'bob',
      amount_cents: null,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  ...overrides,
});

describe('splitEqualAmount', () => {
  it('distributes remainder cents to first participants', () => {
    const shares = splitEqualAmount(100, ['a', 'b', 'c']);
    expect(shares.get('a')).toBe(34);
    expect(shares.get('b')).toBe(33);
    expect(shares.get('c')).toBe(33);
  });
});

describe('computeMemberBalances', () => {
  it('computes net balances for equal split', () => {
    const balances = computeMemberBalances([baseExpense({})]);
    expect(balances).toEqual([
      { userId: 'alice', netCents: 5000 },
      { userId: 'bob', netCents: -5000 },
    ]);
  });

  it('handles custom splits', () => {
    const expense = baseExpense({
      amount_cents: 9000,
      split_mode: 'custom',
      participants: [
        {
          id: 'p1',
          expense_id: 'exp-1',
          trip_id: 'trip-1',
          user_id: 'alice',
          amount_cents: 3000,
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'p2',
          expense_id: 'exp-1',
          trip_id: 'trip-1',
          user_id: 'bob',
          amount_cents: 6000,
          created_at: '2024-01-01T00:00:00Z',
        },
      ],
    });
    const balances = computeMemberBalances([expense]);
    expect(balances).toEqual([
      { userId: 'alice', netCents: 6000 },
      { userId: 'bob', netCents: -6000 },
    ]);
  });
});

describe('simplifySettlements', () => {
  it('minimizes transfers between members', () => {
    const settlements = simplifySettlements([
      { userId: 'alice', netCents: 5000 },
      { userId: 'bob', netCents: -5000 },
    ]);
    expect(settlements).toEqual([{ fromUserId: 'bob', toUserId: 'alice', amountCents: 5000 }]);
  });

  it('settles multiple creditors and debtors', () => {
    const settlements = simplifySettlements([
      { userId: 'alice', netCents: 3000 },
      { userId: 'bob', netCents: 2000 },
      { userId: 'carol', netCents: -5000 },
    ]);
    expect(settlements).toEqual([
      { fromUserId: 'carol', toUserId: 'alice', amountCents: 3000 },
      { fromUserId: 'carol', toUserId: 'bob', amountCents: 2000 },
    ]);
  });
});

describe('validateCustomSplit', () => {
  it('requires amounts to sum to total', () => {
    expect(validateCustomSplit(1000, [400, 600])).toBe(true);
    expect(validateCustomSplit(1000, [400, 500])).toBe(false);
    expect(validateCustomSplit(1000, [-1, 1001])).toBe(false);
  });
});

describe('parseAmountToCents', () => {
  it('parses decimal amounts', () => {
    expect(parseAmountToCents('12.50')).toBe(1250);
    expect(parseAmountToCents('12,50')).toBe(1250);
    expect(parseAmountToCents('')).toBeNull();
    expect(parseAmountToCents('-5')).toBeNull();
  });
});
