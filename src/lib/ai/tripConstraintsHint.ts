export type ConstraintsForAiHint = {
  pace?: 'relaxed' | 'balanced' | 'packed';
  has_children?: boolean;
  preferences?: string;
};

/** When constraints are thin, nudge users to fill trip settings for better AI output. */
export function getAiConstraintsHintLevel(
  summary: ConstraintsForAiHint | null | undefined,
  budgetCents: number | null | undefined,
): 'weak' | 'ok' {
  const hasBudget = typeof budgetCents === 'number' && budgetCents > 0;
  const hasPace = summary?.pace != null;
  const hasChildren = summary?.has_children === true;
  const hasPrefs = !!(summary?.preferences && summary.preferences.trim().length > 0);

  if (hasBudget || hasPace || hasChildren || hasPrefs) return 'ok';
  return 'weak';
}
