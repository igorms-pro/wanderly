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
            <section key={date} className="relative pl-12 sm:pl-20 pb-8 last:pb-0">
              {/* Nœud jour */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="absolute left-3 sm:left-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-white dark:ring-gray-800 z-10"
                  aria-hidden
                />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                  {format(new Date(date), 'EEEE d MMM')}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activities.length} {t('tripDetail.activities')}
                </span>
              </div>

              {/* Cartes activités (alternance gauche/droite sur desktop) */}
              <div className="space-y-3">
                {activities.map((activity, i) => {
                  const isExpanded = expandedId === activity.id;
                  return (
                    <TimelineActivityCard
                      key={activity.id}
                      activity={activity}
                      index={i}
                      currency={currency}
                      canVote={canVote}
                      votingActivityId={votingActivityId}
                      getVoteCounts={getVoteCounts}
                      getUserVote={getUserVote}
                      onVote={onVote}
                      t={t}
                      isExpanded={isExpanded}
                      onToggleExpanded={() =>
                        setExpandedId((prev) => (prev === activity.id ? null : activity.id))
                      }
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
