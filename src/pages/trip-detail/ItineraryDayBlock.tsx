import { format } from 'date-fns';
import { ThumbsUp, ThumbsDown, Clock, DollarSign, Sparkles } from 'lucide-react';
import type { Activity } from '@/lib/mock-supabase';

interface ItineraryDayBlockProps {
  date: string;
  activities: Activity[];
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  /** If true, show a close button and compact header (e.g. in calendar day detail) */
  showClose?: boolean;
  onClose?: () => void;
}

export function ItineraryDayBlock({
  date,
  activities,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  showClose,
  onClose,
}: ItineraryDayBlockProps) {
  const formatTime = (timeStr: string) => {
    const normalized = timeStr.includes('T') ? timeStr : `2000-01-01T${timeStr}`;
    return format(new Date(normalized), 'h:mm a');
  };

  const sorted = [...activities].sort((a, b) =>
    (a.start_time || '').localeCompare(b.start_time || ''),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {activities.length} {t('tripDetail.activities')}
          </p>
        </div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
          >
            {t('tripDetail.close')}
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map((activity) => {
          const { upvotes, downvotes } = getVoteCounts(activity.id);
          const userVote = getUserVote(activity.id);

          return (
            <div
              key={activity.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {activity.title}
                      </h4>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        {activity.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-3">{activity.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {activity.start_time && activity.end_time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                      </div>
                    )}
                    {activity.start_time && !activity.end_time && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(activity.start_time)}
                      </div>
                    )}
                    {activity.cost_cents !== undefined && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />$
                        {(activity.cost_cents / 100).toFixed(2)} {t('tripDetail.perPerson')}
                      </div>
                    )}
                    {activity.source === 'ai' && (
                      <div className="flex items-center text-purple-600 dark:text-purple-400">
                        <Sparkles className="w-4 h-4 mr-1" />
                        {t('tripDetail.aiSuggested')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col items-center space-y-2">
                  <button
                    onClick={() => onVote(activity.id, 'up')}
                    disabled={votingActivityId === activity.id || !canVote}
                    aria-label={
                      userVote === 'up'
                        ? t('tripDetail.removeUpvote') || 'Remove upvote'
                        : t('tripDetail.upvote') || 'Upvote'
                    }
                    className={`p-2 rounded-lg transition ${
                      userVote === 'up'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ThumbsUp
                      className={`w-5 h-5 ${votingActivityId === activity.id ? 'animate-pulse' : ''}`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {upvotes - downvotes > 0 ? '+' : ''}
                    {upvotes - downvotes}
                  </span>
                  <button
                    onClick={() => onVote(activity.id, 'down')}
                    disabled={votingActivityId === activity.id || !canVote}
                    aria-label={
                      userVote === 'down'
                        ? t('tripDetail.removeDownvote') || 'Remove downvote'
                        : t('tripDetail.downvote') || 'Downvote'
                    }
                    className={`p-2 rounded-lg transition ${
                      userVote === 'down'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ThumbsDown
                      className={`w-5 h-5 ${votingActivityId === activity.id ? 'animate-pulse' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
