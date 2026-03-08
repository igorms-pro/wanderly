import { useState } from 'react';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '../../../ItineraryActivityTypes';
import { TimelineActivityHeader } from './TimelineActivityHeader';
import { TimelineActivityMeta } from './TimelineActivityMeta';
import { TimelineActivityVotes } from './TimelineActivityVotes';
import { TimelineActivityParticipants } from './TimelineActivityParticipants';
import { TimelineActivityNotes } from './TimelineActivityNotes';

export interface TimelineActivityCardProps {
  activity: Activity;
  index: number;
  date: string;
  currency: string;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  tripMembersCount?: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
  canEditActivity?: boolean;
  onEditActivity?: (activity: Activity, date: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
  isJustEdited?: boolean;
}

export function TimelineActivityCard({
  activity,
  index,
  date,
  currency,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  isExpanded,
  onToggleExpanded,
  tripMembersCount,
  activityParticipantsMap,
  tripMembers,
  memberProfiles,
  canEditActivity = false,
  onEditActivity,
  onDeleteActivity,
  isJustEdited = false,
}: TimelineActivityCardProps) {
  const { upvotes, downvotes } = getVoteCounts(activity.id);
  const userVote = getUserVote(activity.id);
  const isRight = index % 2 === 0;
  const justEditedClass = isJustEdited
    ? 'ring-2 ring-green-400 dark:ring-green-500 ring-offset-2 dark:ring-offset-gray-800'
    : '';

  const [openParticipants, setOpenParticipants] = useState(false);

  const participantIds =
    activityParticipantsMap[activity.id] != null && activityParticipantsMap[activity.id].length > 0
      ? activityParticipantsMap[activity.id]
      : tripMembers.map((m) => m.user_id);
  const participantsCount = participantIds.length;

  const participantsLabel =
    activityParticipantsMap[activity.id] != null && activityParticipantsMap[activity.id].length > 0
      ? participantsCount === 1
        ? t('tripDetail.participantCount_one')
        : t('tripDetail.participantsCount').replace('{{count}}', String(participantsCount))
      : tripMembersCount != null && tripMembersCount > 0
        ? `${t('tripDetail.participantsAll')} (${tripMembersCount})`
        : t('tripDetail.participantsNotSet');

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden ${justEditedClass} ${
        isRight ? 'sm:ml-8' : 'sm:mr-8'
      }`}
    >
      <div className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <TimelineActivityHeader
            activity={activity}
            isExpanded={isExpanded}
            onToggleExpanded={onToggleExpanded}
            canEdit={canEditActivity}
            onEdit={
              canEditActivity && onEditActivity ? () => onEditActivity(activity, date) : undefined
            }
            onDelete={
              canEditActivity && onDeleteActivity ? () => onDeleteActivity(activity) : undefined
            }
            t={t}
          />
          {activity.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {activity.category}
            </span>
          )}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {activity.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
              )}
              <TimelineActivityParticipants
                participantIds={participantIds}
                participantsCount={participantsCount}
                participantsLabel={participantsLabel}
                memberProfiles={memberProfiles}
                isOpen={openParticipants}
                onToggle={() => setOpenParticipants((prev) => !prev)}
                t={t}
              />
              <TimelineActivityNotes notes={activity.organizer_notes} t={t} />
              <TimelineActivityMeta activity={activity} currency={currency} t={t} />
            </div>
          )}
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
