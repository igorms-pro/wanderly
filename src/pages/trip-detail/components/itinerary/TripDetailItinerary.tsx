import { useState, useEffect } from 'react';
import type { Activity, TripMember } from '@/lib/types/database.types';
import { useItinerarySearch } from './useItinerarySearch';
import { TripItineraryContextSummary } from './TripItineraryContextSummary';
import { ItineraryViewTabs } from './ItineraryViewTabs';
import { TripItineraryEmptyState } from './TripItineraryEmptyState';
import { TripItineraryListView } from './TripItineraryListView';
import { TripItineraryCalendarView } from './TripItineraryCalendarView';
import { TripItineraryTimelineView } from './TripItineraryTimelineView';

const ITINERARY_VIEW_KEY = 'tripDetail:itineraryView';

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
}

interface UseItineraryViewStateArgs {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
}

interface UseItineraryViewStateResult {
  viewMode: ItineraryViewMode;
  selectedDate: string | null;
  searchQuery: string;
  activitiesByDateForView: Record<string, Activity[]>;
  sortedDatesForView: string[];
  handleChangeViewMode: (mode: ItineraryViewMode) => void;
  handleSelectDate: (date: string | null) => void;
  handleSearchChange: (value: string) => void;
}

function useItineraryViewState({
  activitiesByDate,
  sortedDates,
}: UseItineraryViewStateArgs): UseItineraryViewStateResult {
  const [viewMode, setViewMode] = useState<ItineraryViewMode>(() => {
    try {
      const s = sessionStorage.getItem(ITINERARY_VIEW_KEY);
      if (s === 'list' || s === 'calendar' || s === 'timeline') return s;
    } catch {
      /* ignore */
    }
    return 'list';
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { activitiesByDate: filteredActivitiesByDate, sortedDates: filteredSortedDates } =
    useItinerarySearch(activitiesByDate, sortedDates, searchQuery);

  useEffect(() => {
    try {
      sessionStorage.setItem(ITINERARY_VIEW_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  const isSearching = searchQuery.trim().length > 0;

  const activitiesByDateForView = isSearching ? filteredActivitiesByDate : activitiesByDate;
  const sortedDatesForView = isSearching ? filteredSortedDates : sortedDates;

  const handleChangeViewMode = (mode: ItineraryViewMode) => {
    setViewMode(mode);
    setSelectedDate(null);
  };

  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return {
    viewMode,
    selectedDate,
    searchQuery,
    activitiesByDateForView,
    sortedDatesForView,
    handleChangeViewMode,
    handleSelectDate,
    handleSearchChange,
  };
}

export function TripDetailItinerary({
  startDate,
  endDate,
  canEdit,
  canVote,
  activitiesByDate,
  sortedDates,
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
    </div>
  );
}
