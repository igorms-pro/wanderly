import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Activity, TripMember } from '../../../../lib/types/database.types';
import type { MemberProfile } from '../../ItineraryActivityTypes';
import { ItineraryActivityHeaderRow } from './ItineraryActivityHeaderRow';
import { ItineraryActivityDetailsSection } from './ItineraryActivityDetailsSection';

interface ItineraryActivityItemProps {
  activity: Activity;
  index: number;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency: string;
  tripMembersCount?: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
  onDragStart?: (activityId: string, date: string) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (activityId: string, date: string, index: number) => void;
  date?: string;
  canEditActivity?: boolean;
  onEditActivity?: (activity: Activity, date?: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
}

export function ItineraryActivityItem({
  activity,
  index,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  currency,
  tripMembersCount,
  activityParticipantsMap,
  tripMembers,
  memberProfiles,
  onDragStart,
  onDragOver,
  onDrop,
  date,
  canEditActivity = false,
  onEditActivity,
  onDeleteActivity,
}: ItineraryActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { upvotes, downvotes } = getVoteCounts(activity.id);
  const userVote = getUserVote(activity.id);

  const accentClass =
    index % 2 === 1
      ? 'border-l-2 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 transition'
      : 'border-l-2 border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:bg-gray-800/70 transition';

  return (
    <div
      className={accentClass}
      draggable={!!onDragStart && !!date}
      onDragStart={
        onDragStart && date
          ? () => {
              onDragStart(activity.id, date);
            }
          : undefined
      }
      onDragOver={onDragOver}
      onDrop={
        onDrop && date
          ? (event) => {
              event.preventDefault();
              onDrop(activity.id, date, index);
            }
          : undefined
      }
    >
      <ItineraryActivityHeaderRow
        activity={activity}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded((prev) => !prev)}
        t={t}
        upvotes={upvotes}
        downvotes={downvotes}
        canEdit={canEditActivity}
        onEdit={
          canEditActivity && onEditActivity ? () => onEditActivity(activity, date) : undefined
        }
        onDelete={
          canEditActivity && onDeleteActivity ? () => onDeleteActivity(activity) : undefined
        }
      />

      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
          <ItineraryActivityDetailsSection
            activity={activity}
            t={t}
            currency={currency}
            tripMembersCount={tripMembersCount}
            activityParticipantsMap={activityParticipantsMap}
            tripMembers={tripMembers}
            memberProfiles={memberProfiles}
          />

          {activity.status === 'proposed' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onVote(activity.id, 'up')}
                disabled={votingActivityId === activity.id || !canVote}
                aria-label={
                  userVote === 'up' ? t('tripDetail.removeUpvote') : t('tripDetail.upvote')
                }
                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  userVote === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {upvotes}
              </button>
              <button
                type="button"
                onClick={() => onVote(activity.id, 'down')}
                disabled={votingActivityId === activity.id || !canVote}
                aria-label={
                  userVote === 'down' ? t('tripDetail.removeDownvote') : t('tripDetail.downvote')
                }
                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  userVote === 'down'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                {downvotes}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {upvotes - downvotes > 0 ? '+' : ''}
                {upvotes - downvotes} {t('tripDetail.votesNet')}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('tripDetail.votingClosed')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
