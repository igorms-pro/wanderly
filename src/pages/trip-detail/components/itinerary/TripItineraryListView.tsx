import type { Activity, TripMember } from '@/lib/types/database.types';
import type { ConstraintsSummary } from './TripDetailItinerary';
import { ItineraryDayBlock } from './ItineraryDayBlock';
import { useItineraryDragAndDrop } from '../../hooks/useItineraryDragAndDrop';

interface TripItineraryListViewProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  itineraryDayIdByDate: Record<string, string>;
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
  /** When set and no results, show search empty state */
  searchQuery?: string;
}

export function TripItineraryListView({
  sortedDates,
  activitiesByDate,
  itineraryDayIdByDate,
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
  searchQuery = '',
}: TripItineraryListViewProps) {
  const hasSearchNoResults = searchQuery.trim() !== '' && sortedDates.length === 0;

  const dragAndDrop = useItineraryDragAndDrop({
    activitiesByDate,
    sortedDates,
    itineraryDayIdByDate,
    canEdit: true,
  });

  if (hasSearchNoResults) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">{t('tripDetail.searchNoResults')}</p>
      </div>
    );
  }

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
          onDragStart={dragAndDrop.handleDragStart}
          onDragOver={dragAndDrop.handleDragOver}
          onDropOnActivity={dragAndDrop.handleDropOnActivity}
          onDropOnEmpty={dragAndDrop.handleDropOnEmptyDay}
        />
      ))}
    </div>
  );
}
