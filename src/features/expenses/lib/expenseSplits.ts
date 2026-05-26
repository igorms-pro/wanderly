import type {
  ExpenseParticipantInput,
  ExpenseSettlement,
  ExpenseSplitMode,
  ExpenseWithParticipants,
  MemberBalance,
} from '../types';

export function splitEqualAmount(amountCents: number, userIds: string[]): Map<string, number> {
  if (userIds.length === 0) return new Map();
  const base = Math.floor(amountCents / userIds.length);
  let remainder = amountCents - base * userIds.length;
  const shares = new Map<string, number>();
  for (const userId of userIds) {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    shares.set(userId, base + extra);
  }
  return shares;
}

export function computeParticipantShares(
  amountCents: number,
  splitMode: ExpenseSplitMode,
  participants: ExpenseParticipantInput[],
): Map<string, number> {
  if (participants.length === 0) return new Map();

  if (splitMode === 'custom') {
    const shares = new Map<string, number>();
    for (const row of participants) {
      shares.set(row.userId, row.amountCents ?? 0);
    }
    return shares;
  }

  return splitEqualAmount(
    amountCents,
    participants.map((p) => p.userId),
  );
}

export function computeExpenseShares(expense: ExpenseWithParticipants): Map<string, number> {
  return computeParticipantShares(
    expense.amount_cents,
    expense.split_mode,
    expense.participants.map((p) => ({
      userId: p.user_id,
      amountCents: p.amount_cents,
    })),
  );
}

export function computeMemberBalances(expenses: ExpenseWithParticipants[]): MemberBalance[] {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    balances.set(
      expense.paid_by_user_id,
      (balances.get(expense.paid_by_user_id) ?? 0) + expense.amount_cents,
    );
    const shares = computeExpenseShares(expense);
    for (const [userId, owed] of shares) {
      balances.set(userId, (balances.get(userId) ?? 0) - owed);
    }
  }

  return [...balances.entries()]
    .filter(([, netCents]) => netCents !== 0)
    .map(([userId, netCents]) => ({ userId, netCents }));
}

export function simplifySettlements(balances: MemberBalance[]): ExpenseSettlement[] {
  const creditors = balances
    .filter((b) => b.netCents > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.netCents - a.netCents);
  const debtors = balances
    .filter((b) => b.netCents < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.netCents - b.netCents);

  const settlements: ExpenseSettlement[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.netCents, -debtor.netCents);
    if (amount > 0) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountCents: amount,
      });
    }
    creditor.netCents -= amount;
    debtor.netCents += amount;
    if (creditor.netCents === 0) i += 1;
    if (debtor.netCents === 0) j += 1;
  }

  return settlements;
}

export function validateCustomSplit(totalCents: number, amounts: number[]): boolean {
  if (amounts.length === 0) return false;
  if (amounts.some((a) => a < 0)) return false;
  return amounts.reduce((sum, value) => sum + value, 0) === totalCents;
}

export function parseAmountToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}
