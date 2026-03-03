import type { Activity } from '@/lib/types/database.types';
import { TripTimeline } from './TripTimeline';

interface TripItineraryTimelineViewProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency: string;
}

export function TripItineraryTimelineView({
  sortedDates,
  activitiesByDate,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  currency,
}: TripItineraryTimelineViewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-6 sm:p-8">
      <TripTimeline
        sortedDates={sortedDates}
        activitiesByDate={activitiesByDate}
        canVote={canVote}
        votingActivityId={votingActivityId}
        getVoteCounts={getVoteCounts}
        getUserVote={getUserVote}
        onVote={onVote}
        t={t}
        currency={currency}
      />
    </div>
  );
}
