import { ThumbsDown, ThumbsUp } from 'lucide-react';

import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';

interface TripScenarioListProps {
  scenarios: TripScenario[];
  canManage: boolean;
  canVoteScenario: boolean;
  votingScenarioId: string | null;
  winningScenarioIds: string[];
  getScenarioVoteCounts: (itineraryId: string) => { upvotes: number; downvotes: number };
  getUserScenarioVote: (itineraryId: string) => 'up' | 'down' | null;
  onScenarioVote: (itineraryId: string, choice: 'up' | 'down') => void;
  onDelete: (scenarioId: string) => void;
  onPreview: (scenarioId: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function TripScenarioList({
  scenarios,
  canManage,
  canVoteScenario,
  votingScenarioId,
  winningScenarioIds,
  getScenarioVoteCounts,
  getUserScenarioVote,
  onScenarioVote,
  onDelete,
  onPreview,
  t,
}: TripScenarioListProps) {
  if (scenarios.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tripDetail.noScenariosYet')}</p>
    );
  }

  const winningSet = new Set(winningScenarioIds);

  return (
    <ul className="space-y-2">
      {scenarios.map((scenario) => {
        const { upvotes, downvotes } = getScenarioVoteCounts(scenario.id);
        const net = upvotes - downvotes;
        const userVote = getUserScenarioVote(scenario.id);
        const isLeading = winningSet.has(scenario.id);

        return (
          <li
            key={scenario.id}
            className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {scenario.title || t('tripDetail.untitledScenario')}
                </p>
                {isLeading && (
                  <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                    {t('tripDetail.scenarioLeadingBadge')}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {t('tripDetail.scenarioDays', { count: scenario.days.length } as Record<
                  string,
                  number
                >)}
                {scenario.isAiGenerated
                  ? ` · ${t('tripDetail.scenarioAiBadge')}`
                  : ` · ${t('tripDetail.scenarioHumanBadge')}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 sm:ml-3">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onScenarioVote(scenario.id, 'up')}
                  disabled={votingScenarioId === scenario.id || !canVoteScenario}
                  aria-label={
                    userVote === 'up' ? t('tripDetail.removeUpvote') : t('tripDetail.upvote')
                  }
                  className={`p-1.5 rounded-lg transition ${
                    userVote === 'up'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600'
                  } disabled:opacity-50`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium w-6 text-center tabular-nums">
                  {net > 0 ? '+' : ''}
                  {net}
                </span>
                <button
                  type="button"
                  onClick={() => onScenarioVote(scenario.id, 'down')}
                  disabled={votingScenarioId === scenario.id || !canVoteScenario}
                  aria-label={
                    userVote === 'down' ? t('tripDetail.removeDownvote') : t('tripDetail.downvote')
                  }
                  className={`p-1.5 rounded-lg transition ${
                    userVote === 'down'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600'
                  } disabled:opacity-50`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onPreview(scenario.id)}
                className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100"
              >
                {t('tripDetail.previewScenario')}
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onDelete(scenario.id)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  {t('tripDetail.deleteScenario')}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
