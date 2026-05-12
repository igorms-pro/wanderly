import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface TimelineActivityVotesProps {
  activityStatus: string;
  canVote: boolean;
  votingActivityId: string | null;
  activityId: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
}

export function TimelineActivityVotes({
  activityStatus,
  canVote,
  votingActivityId,
  activityId,
  upvotes,
  downvotes,
  userVote,
  onVote,
  t,
}: TimelineActivityVotesProps) {
  if (activityStatus !== 'proposed') {
    return (
      <span
        className={`text-xs font-medium ${
          activityStatus === 'confirmed'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {activityStatus === 'confirmed'
          ? t('tripDetail.activityValidated')
          : t('tripDetail.activityRejected')}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onVote(activityId, 'up')}
        disabled={votingActivityId === activityId || !canVote}
        aria-label={userVote === 'up' ? t('tripDetail.removeUpvote') : t('tripDetail.upvote')}
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
        onClick={() => onVote(activityId, 'down')}
        disabled={votingActivityId === activityId || !canVote}
        aria-label={userVote === 'down' ? t('tripDetail.removeDownvote') : t('tripDetail.downvote')}
        className={`p-1.5 rounded-lg transition ${
          userVote === 'down'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600'
        } disabled:opacity-50`}
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </>
  );
}
