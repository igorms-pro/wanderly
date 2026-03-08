import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '../../ItineraryActivityTypes';
import { TripTimeline } from './TripTimeline';

interface TripItineraryTimelineViewProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  canVote: boolean;
  canEdit: boolean;
  canReorder?: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency: string;
  membersCount: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
  onEditActivity?: (activity: Activity, date: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
  lastEditedActivityId?: string | null;
  onDragStart?: (activityId: string, date: string) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropOnActivity?: (
    targetActivityId: string,
    targetDate: string,
    targetIndex: number,
  ) => Promise<void>;
  onDropOnEmptyDay?: (targetDate: string) => Promise<void>;
}

export function TripItineraryTimelineView({
  sortedDates,
  activitiesByDate,
  canVote,
  canEdit,
  canReorder,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  currency,
  membersCount,
  activityParticipantsMap,
  tripMembers,
  memberProfiles,
  onEditActivity,
  onDeleteActivity,
  lastEditedActivityId = null,
  onDragStart,
  onDragOver,
  onDropOnActivity,
  onDropOnEmptyDay,
}: TripItineraryTimelineViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg pl-3 pt-6 pr-6 pb-6 sm:p-8">
      <TripTimeline
        sortedDates={sortedDates}
        activitiesByDate={activitiesByDate}
        canVote={canVote}
        canEdit={canEdit}
        canReorder={canReorder}
        votingActivityId={votingActivityId}
        getVoteCounts={getVoteCounts}
        getUserVote={getUserVote}
        onVote={onVote}
        t={t}
        currency={currency}
        membersCount={membersCount}
        activityParticipantsMap={activityParticipantsMap}
        tripMembers={tripMembers}
        memberProfiles={memberProfiles}
        onEditActivity={onEditActivity}
        onDeleteActivity={onDeleteActivity}
        lastEditedActivityId={lastEditedActivityId}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDropOnActivity={onDropOnActivity}
        onDropOnEmptyDay={onDropOnEmptyDay}
      />
    </div>
  );
}
