import type { Activity, TripMember } from '@/lib/types/database.types';
import { TripWeekGrid } from './TripWeekGrid';
import { ItineraryDayBlock } from './ItineraryDayBlock';

interface TripItineraryCalendarViewProps {
  startDate: string;
  endDate: string;
  activitiesByDate: Record<string, Activity[]>;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
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
}

export function TripItineraryCalendarView({
  startDate,
  endDate,
  activitiesByDate,
  selectedDate,
  onSelectDate,
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
}: TripItineraryCalendarViewProps) {
  return (
    <div className="space-y-6">
      <TripWeekGrid
        startDate={startDate}
        endDate={endDate}
        activitiesByDate={activitiesByDate}
        selectedDate={selectedDate}
        onSelectDay={onSelectDate}
        t={t}
      />
      {selectedDate && activitiesByDate[selectedDate]?.length > 0 && (
        <ItineraryDayBlock
          date={selectedDate}
          activities={activitiesByDate[selectedDate]}
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
          showClose
          onClose={() => onSelectDate(null)}
        />
      )}
    </div>
  );
}
