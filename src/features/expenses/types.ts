import type { Expense, ExpenseParticipant } from '@/lib/types/database.types';

export type ExpenseSplitMode = 'equal' | 'custom';

export type ExpenseParticipantInput = {
  userId: string;
  amountCents?: number | null;
};

export type ExpenseWithParticipants = Expense & {
  participants: ExpenseParticipant[];
};

export type ExpenseFormValues = {
  title: string;
  amountCents: number;
  currency: string;
  paidByUserId: string;
  splitMode: ExpenseSplitMode;
  participantUserIds: string[];
  customAmounts: Record<string, number>;
  expenseDate: string;
  notes: string;
};

export type MemberBalance = {
  userId: string;
  netCents: number;
};

export type ExpenseSettlement = {
  fromUserId: string;
  toUserId: string;
  amountCents: number;
};
