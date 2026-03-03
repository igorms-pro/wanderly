import { useState, useEffect, useMemo } from 'react';
import type { Activity, TripMember } from '@/lib/types/database.types';

function filterActivitiesByQuery(
  activitiesByDate: Record<string, Activity[]>,
  sortedDates: string[],
  query: string,
): { activitiesByDate: Record<string, Activity[]>; sortedDates: string[] } {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { activitiesByDate, sortedDates };
  }
  const filtered: Record<string, Activity[]> = {};
  for (const date of sortedDates) {
    const activities = activitiesByDate[date] ?? [];
    const match = activities.filter(
      (a) =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.place_name && a.place_name.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q)),
    );
    if (match.length > 0) filtered[date] = match;
  }
  return {
    activitiesByDate: filtered,
    sortedDates: sortedDates.filter((d) => filtered[d]?.length),
  };
}

function useItinerarySearch(
  activitiesByDate: Record<string, Activity[]>,
  sortedDates: string[],
  query: string,
): { activitiesByDate: Record<string, Activity[]>; sortedDates: string[] } {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);

    return () => clearTimeout(handle);
  }, [query]);

  return useMemo(
    () => filterActivitiesByQuery(activitiesByDate, sortedDates, debouncedQuery),
    [activitiesByDate, sortedDates, debouncedQuery],
  );
}
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
        onChangeViewMode={(mode) => {
          setViewMode(mode);
          setSelectedDate(null);
        }}
        onAddActivity={onAddActivity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {sortedDates.length === 0 ? (
        <TripItineraryEmptyState t={t} canEdit={canEdit} onAddActivity={onAddActivity} />
      ) : viewMode === 'list' ? (
        <TripItineraryListView
          sortedDates={searchQuery.trim() ? filteredSortedDates : sortedDates}
          activitiesByDate={searchQuery.trim() ? filteredActivitiesByDate : activitiesByDate}
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
          activitiesByDate={searchQuery.trim() ? filteredActivitiesByDate : activitiesByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
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
          sortedDates={searchQuery.trim() ? filteredSortedDates : sortedDates}
          activitiesByDate={searchQuery.trim() ? filteredActivitiesByDate : activitiesByDate}
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
