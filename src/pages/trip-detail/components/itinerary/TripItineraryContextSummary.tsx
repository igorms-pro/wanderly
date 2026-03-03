import type { ConstraintsSummary } from './TripDetailItinerary';

interface TripItineraryContextSummaryProps {
  t: (key: string) => string;
  totalSpentCents: number;
  budgetCents: number | null;
  currency: string;
  constraintsSummary?: ConstraintsSummary | null;
  membersCount?: number;
}

export function TripItineraryContextSummary({
  t,
  totalSpentCents,
  budgetCents,
  currency,
  constraintsSummary,
  membersCount = 0,
}: TripItineraryContextSummaryProps) {
  const spentFormatted = (totalSpentCents / 100).toFixed(0);
  const budgetFormatted = budgetCents != null ? (budgetCents / 100).toFixed(0) : null;
  const overBudget = budgetCents != null && totalSpentCents > budgetCents;

  const hasConstraints =
    constraintsSummary &&
    (constraintsSummary.pace ||
      constraintsSummary.has_children ||
      (constraintsSummary.preferences && constraintsSummary.preferences.trim() !== ''));

  const showContextBlock = hasConstraints || membersCount > 0;

  if (!showContextBlock && totalSpentCents <= 0 && budgetCents == null) {
    return null;
  }

  return (
    <div className="space-y-3">
      {showContextBlock && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tripDetail.constraintsSummary')}
          </span>
          {hasConstraints && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {[
                constraintsSummary!.pace && t(`tripModal.${constraintsSummary!.pace}`),
                constraintsSummary!.has_children && t('tripDetail.withChildren'),
                constraintsSummary!.preferences?.trim(),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {membersCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {membersCount} {membersCount === 1 ? t('tripDetail.member') : t('tripDetail.members')}
            </p>
          )}
        </div>
      )}
      {(totalSpentCents > 0 || budgetCents != null) && (
        <div
          className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
            overBudget
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
          }`}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tripDetail.expensesCumulative')}
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {spentFormatted} {currency}
            {budgetFormatted != null && (
              <span
                className={
                  overBudget
                    ? ' text-red-600 dark:text-red-400'
                    : ' text-gray-500 dark:text-gray-400'
                }
              >
                {' '}
                / {budgetFormatted} {currency}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
