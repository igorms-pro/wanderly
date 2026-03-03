import type { Activity } from '@/lib/types/database.types';
import { TimelineActivityHeader } from './TimelineActivityHeader';
import { TimelineActivityMeta } from './TimelineActivityMeta';
import { TimelineActivityVotes } from './TimelineActivityVotes';

export interface TimelineActivityCardProps {
  activity: Activity;
  index: number;
  currency: string;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function TimelineActivityCard({
  activity,
  index,
  currency,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  isExpanded,
  onToggleExpanded,
}: TimelineActivityCardProps) {
  const { upvotes, downvotes } = getVoteCounts(activity.id);
  const userVote = getUserVote(activity.id);
  const isRight = index % 2 === 0;

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden ${
        isRight ? 'sm:ml-8' : 'sm:mr-8'
      }`}
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <TimelineActivityHeader
            activity={activity}
            isExpanded={isExpanded}
            onToggleExpanded={onToggleExpanded}
          />
          {activity.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {activity.category}
            </span>
          )}
          {isExpanded && activity.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
          )}
          {isExpanded && <TimelineActivityMeta activity={activity} currency={currency} t={t} />}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <TimelineActivityVotes
            activityStatus={activity.status}
            canVote={canVote}
            votingActivityId={votingActivityId}
            activityId={activity.id}
            upvotes={upvotes}
            downvotes={downvotes}
            userVote={userVote}
            onVote={onVote}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
