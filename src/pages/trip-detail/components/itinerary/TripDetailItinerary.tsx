import type { Activity, TripMember } from '@/lib/types/database.types';

import { TripItineraryContextSummary } from './TripItineraryContextSummary';
import { ItineraryViewTabs } from './ItineraryViewTabs';
import { useItineraryViewState } from './useItineraryViewState';
import { useItineraryDragAndDrop } from '../../hooks/useItineraryDragAndDrop';
import { TripDetailItineraryViews } from './TripDetailItineraryViews';
import { TripDetailItineraryScenarios } from './TripDetailItineraryScenarios';

export type ItineraryViewMode = 'list' | 'calendar' | 'timeline';

export interface ConstraintsSummary {
  pace?: 'relaxed' | 'balanced' | 'packed';
  has_children?: boolean;
  preferences?: string;
}

interface TripDetailItineraryProps {
  startDate: string;
  endDate: string;
  canEdit: boolean;
  canReorder: boolean;
  canVote: boolean;
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
  itineraryDayIdByDate: Record<string, string>;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  onAddActivity: () => void;
  t: (key: string) => string;
  totalSpentCents?: number;
  budgetCents?: number | null;
  currency?: string;
  constraintsSummary?: ConstraintsSummary | null;
  membersCount?: number;
  activityParticipantsMap?: Record<string, string[]>;
  tripMembers?: TripMember[];
  memberProfiles?: Record<string, { display_name: string | null; avatar_url: string | null }>;
  scenarios?: import('@/lib/store/tripDetailSlice.scenarios').TripScenario[];
  canCreateScenarios?: boolean;
  canManageScenarios?: boolean;
  onGenerateAiScenario?: () => Promise<void>;
  onCreateScenario?: (title: string | null, days: { date: string; dayIndex?: number }[]) => void;
  onDeleteScenario?: (scenarioId: string) => void;
  onUseScenarioAsBase?: (scenarioItineraryId: string) => Promise<void>;
  onAddScenarioActivityToItinerary?: (date: string, activity: Activity) => Promise<void>;
  onEditActivity?: (activity: Activity, date: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
  lastEditedActivityId?: string | null;
}

export function TripDetailItinerary({
  startDate,
  endDate,
  canEdit,
  canReorder,
  canVote,
  activitiesByDate,
  sortedDates,
  itineraryDayIdByDate,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  onAddActivity,
  t,
  totalSpentCents = 0,
  budgetCents = null,
  currency = 'EUR',
  constraintsSummary,
  membersCount = 0,
  activityParticipantsMap = {},
  tripMembers = [],
  memberProfiles = {},
  scenarios = [],
  canCreateScenarios = false,
  canManageScenarios = false,
  onGenerateAiScenario,
  onCreateScenario,
  onDeleteScenario,
  onUseScenarioAsBase,
  onAddScenarioActivityToItinerary,
  onEditActivity,
  onDeleteActivity,
  lastEditedActivityId = null,
}: TripDetailItineraryProps) {
  const {
    viewMode,
    selectedDate,
    searchQuery,
    activitiesByDateForView,
    sortedDatesForView,
    handleChangeViewMode,
    handleSelectDate,
    handleSearchChange,
  } = useItineraryViewState({ activitiesByDate, sortedDates });

  const dragAndDrop = useItineraryDragAndDrop({
    activitiesByDate: activitiesByDateForView,
    sortedDates: sortedDatesForView,
    itineraryDayIdByDate,
    canEdit: canReorder,
  });

  return (
    <div className="space-y-6">
      <TripItineraryContextSummary
        t={t}
        totalSpentCents={totalSpentCents}
        budgetCents={budgetCents}
        currency={currency}
        constraintsSummary={constraintsSummary}
        membersCount={membersCount}
      />

      <ItineraryViewTabs
        t={t}
        canEdit={canEdit}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        onAddActivity={onAddActivity}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <TripDetailItineraryViews
        startDate={startDate}
        endDate={endDate}
        viewMode={viewMode}
        selectedDate={selectedDate}
        sortedDates={sortedDates}
        sortedDatesForView={sortedDatesForView}
        activitiesByDateForView={activitiesByDateForView}
        itineraryDayIdByDate={itineraryDayIdByDate}
        canEdit={canEdit}
        canReorder={canReorder}
        canVote={canVote}
        votingActivityId={votingActivityId}
        getVoteCounts={getVoteCounts}
        getUserVote={getUserVote}
        onVote={onVote}
        onAddActivity={onAddActivity}
        onSelectDate={handleSelectDate}
        onEditActivity={onEditActivity}
        onDeleteActivity={onDeleteActivity}
        lastEditedActivityId={lastEditedActivityId}
        t={t}
        currency={currency}
        membersCount={membersCount}
        activityParticipantsMap={activityParticipantsMap}
        tripMembers={tripMembers}
        memberProfiles={memberProfiles}
        constraintsSummary={constraintsSummary}
        searchQuery={searchQuery}
        dragAndDrop={dragAndDrop}
      />

      <TripDetailItineraryScenarios
        scenarios={scenarios}
        sortedDates={sortedDates}
        canCreate={canCreateScenarios}
        canManage={canManageScenarios}
        t={t}
        onGenerateAiScenario={onGenerateAiScenario}
        onCreateScenario={onCreateScenario}
        onDeleteScenario={onDeleteScenario}
        onUseScenarioAsBase={onUseScenarioAsBase}
        onAddScenarioActivityToItinerary={onAddScenarioActivityToItinerary}
      />
    </div>
  );
}
