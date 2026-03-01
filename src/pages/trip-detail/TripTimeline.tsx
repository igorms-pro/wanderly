import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, Clock, DollarSign, Sparkles } from 'lucide-react';
import type { Activity } from '@/lib/types/database.types';

interface TripTimelineProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
}

export function TripTimeline({
  sortedDates,
  activitiesByDate,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
}: TripTimelineProps) {
  const formatTime = (timeStr: string) => {
    const normalized = timeStr.includes('T') ? timeStr : `2000-01-01T${timeStr}`;
    return format(new Date(normalized), 'HH:mm');
  };

  return (
    <div className="relative">
      {/* Fil vertical */}
      <div
        className="absolute left-5 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 dark:from-blue-600 dark:via-blue-500 dark:to-blue-600 rounded-full"
        aria-hidden
      />

      <div className="space-y-0">
        {sortedDates.map((date) => {
          const activities = [...(activitiesByDate[date] || [])].sort((a, b) =>
            (a.start_time || '').localeCompare(b.start_time || ''),
          );

          return (
            <section key={date} className="relative pl-12 sm:pl-20 pb-8 last:pb-0">
              {/* Nœud jour */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="absolute left-3 sm:left-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-white dark:ring-gray-800 z-10"
                  aria-hidden
                />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  {format(new Date(date), 'EEEE d MMM')}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activities.length} {t('tripDetail.activities')}
                </span>
              </div>

              {/* Cartes activités (alternance gauche/droite sur desktop) */}
              <div className="space-y-3">
                {activities.map((activity, i) => {
                  const { upvotes, downvotes } = getVoteCounts(activity.id);
                  const userVote = getUserVote(activity.id);
                  const isRight = i % 2 === 0;

                  return (
                    <div
                      key={activity.id}
                      className={`rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden ${
                        isRight ? 'sm:ml-8' : 'sm:mr-8'
                      }`}
                    >
                      <div className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {activity.title}
                          </h4>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            {activity.category}
                          </span>
                          {activity.description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {activity.start_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(activity.start_time)}
                              </span>
                            )}
                            {activity.cost_cents !== undefined && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />$
                                {(activity.cost_cents / 100).toFixed(0)}
                              </span>
                            )}
                            {activity.source === 'ai' && (
                              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <Sparkles className="w-3 h-3" />
                                {t('tripDetail.aiSuggested')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {activity.status === 'proposed' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => onVote(activity.id, 'up')}
                                disabled={votingActivityId === activity.id || !canVote}
                                aria-label={userVote === 'up' ? 'Remove upvote' : 'Upvote'}
                                className={`p-1.5 rounded-lg transition ${
                                  userVote === 'up'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600'
                                } disabled:opacity-50`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium w-6 text-center">
                                {upvotes - downvotes > 0 ? '+' : ''}
                                {upvotes - downvotes}
                              </span>
                              <button
                                type="button"
                                onClick={() => onVote(activity.id, 'down')}
                                disabled={votingActivityId === activity.id || !canVote}
                                aria-label={userVote === 'down' ? 'Remove downvote' : 'Downvote'}
                                className={`p-1.5 rounded-lg transition ${
                                  userVote === 'down'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600'
                                } disabled:opacity-50`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span
                              className={`text-xs font-medium ${
                                activity.status === 'confirmed'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {activity.status === 'confirmed'
                                ? t('tripDetail.activityValidated')
                                : t('tripDetail.activityRejected')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
