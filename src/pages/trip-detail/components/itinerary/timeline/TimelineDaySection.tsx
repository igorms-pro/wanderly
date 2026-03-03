import { format } from 'date-fns';
import type { Activity } from '@/lib/types/database.types';
import { TimelineActivityCard } from './TimelineActivityCard';

interface TimelineDaySectionProps {
  date: string;
  activities: Activity[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency: string;
}

export function TimelineDaySection({
  date,
  activities,
  expandedId,
  setExpandedId,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  currency,
}: TimelineDaySectionProps) {
  const sortedActivities = [...activities].sort((a, b) =>
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
          {sortedActivities.length} {t('tripDetail.activities')}
        </span>
      </div>

      {/* Cartes activités (alternance gauche/droite sur desktop) */}
      <div className="space-y-3">
        {sortedActivities.map((activity, i) => {
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
                setExpandedId(expandedId === activity.id ? null : activity.id)
              }
            />
          );
        })}
      </div>
    </section>
  );
}
