import type { Activity, TripMember } from '@/lib/types/database.types';
import { TripItineraryContextSummary } from './TripItineraryContextSummary';
import { ItineraryViewTabs } from './ItineraryViewTabs';
import { TripItineraryEmptyState } from './TripItineraryEmptyState';
import { TripItineraryListView } from './TripItineraryListView';
import { TripItineraryCalendarView } from './TripItineraryCalendarView';
import { TripItineraryTimelineView } from './TripItineraryTimelineView';
import { TripScenariosSection } from '../scenarios/TripScenariosSection';
import { useItineraryViewState } from './useItineraryViewState';

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
  onAddScenarioActivityToItinerary?: (
    date: string,
    activity: import('@/lib/types/database.types').Activity,
  ) => Promise<void>;
  onEditActivity?: (activity: Activity, date: string) => void;
  onDeleteActivity?: (activity: Activity) => void;
}

export function TripDetailItinerary({
  startDate,
  endDate,
  canEdit,
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

      {sortedDates.length === 0 ? (
        <TripItineraryEmptyState t={t} canEdit={canEdit} onAddActivity={onAddActivity} />
      ) : viewMode === 'list' ? (
        <TripItineraryListView
          sortedDates={sortedDatesForView}
          activitiesByDate={activitiesByDateForView}
          itineraryDayIdByDate={itineraryDayIdByDate}
          canEdit={canEdit}
          canVote={canVote}
          votingActivityId={votingActivityId}
          getVoteCounts={getVoteCounts}
          getUserVote={getUserVote}
          onVote={onVote}
          t={t}
          currency={currency}
          membersCount={membersCount}
          activityParticipantsMap={activityParticipantsMap}
          tripMembers={tripMembers}
          memberProfiles={memberProfiles}
          constraintsSummary={constraintsSummary}
          searchQuery={searchQuery}
          onEditActivity={onEditActivity}
          onDeleteActivity={onDeleteActivity}
        />
      ) : viewMode === 'calendar' ? (
        <TripItineraryCalendarView
          startDate={startDate}
          endDate={endDate}
          activitiesByDate={activitiesByDateForView}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          canVote={canVote}
          votingActivityId={votingActivityId}
          getVoteCounts={getVoteCounts}
          getUserVote={getUserVote}
          onVote={onVote}
          t={t}
          currency={currency}
          membersCount={membersCount}
          activityParticipantsMap={activityParticipantsMap}
          tripMembers={tripMembers}
          memberProfiles={memberProfiles}
        />
      ) : (
        <TripItineraryTimelineView
          sortedDates={sortedDatesForView}
          activitiesByDate={activitiesByDateForView}
          canVote={canVote}
          votingActivityId={votingActivityId}
          getVoteCounts={getVoteCounts}
          getUserVote={getUserVote}
          onVote={onVote}
          t={t}
          currency={currency}
          membersCount={membersCount}
          activityParticipantsMap={activityParticipantsMap}
          tripMembers={tripMembers}
          memberProfiles={memberProfiles}
        />
      )}

      {onCreateScenario &&
        onDeleteScenario &&
        onGenerateAiScenario &&
        onUseScenarioAsBase &&
        onAddScenarioActivityToItinerary && (
          <TripScenariosSection
            scenarios={scenarios}
            sortedDates={sortedDates}
            canCreate={canCreateScenarios}
            canManage={canManageScenarios}
            onGenerateAiScenario={onGenerateAiScenario}
            onCreateScenario={onCreateScenario}
            onDeleteScenario={onDeleteScenario}
            onUseScenarioAsBase={onUseScenarioAsBase}
            onAddScenarioActivityToItinerary={onAddScenarioActivityToItinerary}
            t={t}
          />
        )}
    </div>
  );
}
