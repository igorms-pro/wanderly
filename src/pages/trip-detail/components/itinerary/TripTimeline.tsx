import { useState } from 'react';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '../../ItineraryActivityTypes';
import { TimelineDaySection } from './timeline/TimelineDaySection';

interface TripTimelineProps {
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
  currency?: string;
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

export function TripTimeline({
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
  currency = 'EUR',
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
}: TripTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Fil vertical */}
      <div
        className="absolute left-4 sm:left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 dark:from-blue-600 dark:via-blue-500 dark:to-blue-600 rounded-full"
        aria-hidden
      />

      <div className="space-y-0">
        {sortedDates.map((date) => {
          const activities = [...(activitiesByDate[date] || [])].sort((a, b) =>
            (a.start_time || '').localeCompare(b.start_time || ''),
          );

          return (
            <TimelineDaySection
              key={date}
              date={date}
              activities={activities}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
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
          );
        })}
      </div>
    </div>
  );
}
