import type { Activity, TripMember } from '@/lib/types/database.types';

import { TripItineraryEmptyState } from './TripItineraryEmptyState';
import { TripItineraryListView } from './TripItineraryListView';
import { TripItineraryCalendarView } from './TripItineraryCalendarView';
import { TripItineraryTimelineView } from './TripItineraryTimelineView';
import { TripItineraryDecisionView } from './TripItineraryDecisionView';
import type { ItineraryViewMode, ConstraintsSummary } from './TripDetailItinerary';
import type { UseItineraryDragAndDropResult } from '../../hooks/useItineraryDragAndDrop';

interface TripDetailItineraryViewsProps {
  startDate: string;
  endDate: string;
  viewMode: ItineraryViewMode;
  selectedDate: string | null;
  sortedDates: string[];
  sortedDatesForView: string[];
  activitiesByDateForView: Record<string, Activity[]>;
  itineraryDayIdByDate: Record<string, string>;
  canEdit: boolean;
  canReorder: boolean;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  onAddActivity: () => void;
  onSelectDate: (date: string) => void;
  onEditActivity?: (activity: Activity, date: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
  lastEditedActivityId?: string | null;
  t: (key: string) => string;
  currency?: string;
  membersCount?: number;
  activityParticipantsMap?: Record<string, string[]>;
  tripMembers?: TripMember[];
  memberProfiles?: Record<string, { display_name: string | null; avatar_url: string | null }>;
  constraintsSummary?: ConstraintsSummary | null;
  searchQuery?: string;
  dragAndDrop: UseItineraryDragAndDropResult;
}

export function TripDetailItineraryViews({
  startDate,
  endDate,
  viewMode,
  selectedDate,
  sortedDates,
  sortedDatesForView,
  activitiesByDateForView,
  itineraryDayIdByDate,
  canEdit,
  canReorder,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  onAddActivity,
  onSelectDate,
  onEditActivity,
  onDeleteActivity,
  lastEditedActivityId = null,
  t,
  currency = 'EUR',
  membersCount = 0,
  activityParticipantsMap = {},
  tripMembers = [],
  memberProfiles = {},
  constraintsSummary,
  searchQuery = '',
  dragAndDrop,
}: TripDetailItineraryViewsProps) {
  const dragHandlers = canReorder
    ? {
        onDragStart: dragAndDrop.handleDragStart,
        onDragOver: dragAndDrop.handleDragOver,
        onDropOnActivity: dragAndDrop.handleDropOnActivity,
        onDropOnEmptyDay: dragAndDrop.handleDropOnEmptyDay,
      }
    : {};

  const sharedProps = {
    canEdit,
    canReorder,
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
    onEditActivity,
    onDeleteActivity,
    lastEditedActivityId,
    ...dragHandlers,
  };

  if (sortedDates.length === 0) {
    return <TripItineraryEmptyState t={t} canEdit={canEdit} onAddActivity={onAddActivity} />;
  }

  if (viewMode === 'decision') {
    return (
      <TripItineraryDecisionView
        sortedDates={sortedDatesForView}
        activitiesByDate={activitiesByDateForView}
        getVoteCounts={getVoteCounts}
        t={t}
        searchQuery={searchQuery}
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <TripItineraryListView
        {...sharedProps}
        sortedDates={sortedDatesForView}
        activitiesByDate={activitiesByDateForView}
        itineraryDayIdByDate={itineraryDayIdByDate}
        constraintsSummary={constraintsSummary}
        searchQuery={searchQuery}
      />
    );
  }

  if (viewMode === 'calendar') {
    return (
      <TripItineraryCalendarView
        {...sharedProps}
        startDate={startDate}
        endDate={endDate}
        activitiesByDate={activitiesByDateForView}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />
    );
  }

  return (
    <TripItineraryTimelineView
      {...sharedProps}
      sortedDates={sortedDatesForView}
      activitiesByDate={activitiesByDateForView}
    />
  );
}
