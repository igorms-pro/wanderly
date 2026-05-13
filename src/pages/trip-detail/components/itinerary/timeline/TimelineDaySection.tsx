import { Fragment } from 'react';
import { format } from 'date-fns';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '../../../ItineraryActivityTypes';
import { sortActivitiesByDayOrder } from '../../../hooks/itinerary-utils';
import { TimelineActivityCard } from './TimelineActivityCard';
import { TimelineTravelBetween } from './TimelineTravelBetween';

interface TimelineDaySectionProps {
  date: string;
  activities: Activity[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  canVote: boolean;
  canEdit: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  currency: string;
  membersCount: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
  onEditActivity?: (activity: Activity, date: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
  lastEditedActivityId?: string | null;
  canReorder?: boolean;
  onDragStart?: (activityId: string, date: string) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropOnActivity?: (
    targetActivityId: string,
    targetDate: string,
    targetIndex: number,
  ) => Promise<void>;
  onDropOnEmptyDay?: (targetDate: string) => Promise<void>;
}

export function TimelineDaySection({
  date,
  activities,
  expandedId,
  setExpandedId,
  canVote,
  canEdit,
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
  canReorder,
  onDragStart,
  onDragOver,
  onDropOnActivity,
  onDropOnEmptyDay,
}: TimelineDaySectionProps) {
  const sortedActivities = sortActivitiesByDayOrder(activities);

  return (
    <section key={date} className="relative pl-10 sm:pl-18 pb-8 last:pb-0">
      {/* Nœud jour */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="absolute left-2.5 sm:left-5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 dark:bg-blue-400 ring-4 ring-white dark:ring-gray-800 z-10"
          aria-hidden
        />
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
          {format(new Date(date), 'EEEE d MMM')}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sortedActivities.length} {t('tripDetail.activities')}
        </span>
      </div>

      {/* Cartes activités (alternance gauche/droite sur desktop) + drop zone for empty day */}
      <div
        className={`space-y-3 ${sortedActivities.length === 0 && canReorder ? 'min-h-[80px] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center' : ''}`}
        onDragOver={canReorder ? onDragOver : undefined}
        onDrop={
          canReorder && onDropOnEmptyDay && sortedActivities.length === 0
            ? (event) => {
                event.preventDefault();
                onDropOnEmptyDay(date);
              }
            : undefined
        }
      >
        {sortedActivities.length === 0 && canReorder && (
          <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
            {t('tripDetail.dropActivityHere')}
          </p>
        )}
        {sortedActivities.map((activity, i) => {
          const isExpanded = expandedId === activity.id;
          const prev = i > 0 ? sortedActivities[i - 1] : null;
          return (
            <Fragment key={activity.id}>
              {prev ? <TimelineTravelBetween prev={prev} next={activity} t={t} /> : null}
              <TimelineActivityCard
                activity={activity}
                index={i}
                date={date}
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
                tripMembersCount={membersCount}
                activityParticipantsMap={activityParticipantsMap}
                tripMembers={tripMembers}
                memberProfiles={memberProfiles}
                canEditActivity={canEdit}
                onEditActivity={onEditActivity}
                onDeleteActivity={onDeleteActivity}
                isJustEdited={lastEditedActivityId === activity.id}
                canReorder={canReorder}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={canReorder ? onDropOnActivity : undefined}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
