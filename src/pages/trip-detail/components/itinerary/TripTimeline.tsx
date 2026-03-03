import { useState } from 'react';
import type { Activity } from '@/lib/types/database.types';
import { TimelineDaySection } from './timeline/TimelineDaySection';

interface TripTimelineProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency?: string;
}

export function TripTimeline({
  sortedDates,
  activitiesByDate,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  currency = 'EUR',
}: TripTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Fil vertical */}
      <div
        className="absolute left-5 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300 dark:from-blue-600 dark:via-blue-500 dark:to-blue-600 rounded-full"
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
              votingActivityId={votingActivityId}
              getVoteCounts={getVoteCounts}
              getUserVote={getUserVote}
              onVote={onVote}
              t={t}
              currency={currency}
            />
          );
        })}
      </div>
    </div>
  );
}
