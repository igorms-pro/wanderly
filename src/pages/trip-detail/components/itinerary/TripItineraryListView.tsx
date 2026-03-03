import type { Activity, TripMember } from '@/lib/types/database.types';
import type { ConstraintsSummary } from './TripDetailItinerary';
import { ItineraryDayBlock } from './ItineraryDayBlock';

interface TripItineraryListViewProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency: string;
  membersCount: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, { display_name: string | null; avatar_url: string | null }>;
  constraintsSummary?: ConstraintsSummary | null;
}

export function TripItineraryListView({
  sortedDates,
  activitiesByDate,
  canVote,
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
}: TripItineraryListViewProps) {
  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <ItineraryDayBlock
          key={date}
          date={date}
          activities={activitiesByDate[date]}
          canVote={canVote}
          votingActivityId={votingActivityId}
          getVoteCounts={getVoteCounts}
          getUserVote={getUserVote}
          onVote={onVote}
          t={t}
          currency={currency}
          tripMembersCount={membersCount}
          activityParticipantsMap={activityParticipantsMap}
          tripMembers={tripMembers}
          memberProfiles={memberProfiles}
        />
      ))}
    </div>
  );
}
