import { useState, useEffect } from 'react';
import { Plus, List, Calendar, Map } from 'lucide-react';
import type { Activity, TripMember } from '@/lib/types/database.types';
import { ItineraryDayBlock } from './ItineraryDayBlock';
import { TripWeekGrid } from './TripWeekGrid';
import { TripTimeline } from './TripTimeline';

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

  useEffect(() => {
    try {
      sessionStorage.setItem(ITINERARY_VIEW_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  const viewTabs: { id: ItineraryViewMode; label: string; icon: typeof List }[] = [
    { id: 'list', label: t('tripDetail.itineraryViewList'), icon: List },
    { id: 'calendar', label: t('tripDetail.itineraryViewCalendar'), icon: Calendar },
    { id: 'timeline', label: t('tripDetail.itineraryViewVoyage'), icon: Map },
  ];

  const spentFormatted = (totalSpentCents / 100).toFixed(0);
  const budgetFormatted = budgetCents != null ? (budgetCents / 100).toFixed(0) : null;
  const overBudget = budgetCents != null && totalSpentCents > budgetCents;

  const hasConstraints =
    constraintsSummary &&
    (constraintsSummary.pace ||
      constraintsSummary.has_children ||
      (constraintsSummary.preferences && constraintsSummary.preferences.trim() !== ''));

  const showContextBlock = hasConstraints || membersCount > 0;

  return (
    <div className="space-y-6">
      {/* Résumé contraintes + membres + dépenses */}
      {(showContextBlock || totalSpentCents > 0 || budgetCents != null) && (
        <div className="space-y-3">
          {showContextBlock && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tripDetail.constraintsSummary')}
              </span>
              {hasConstraints && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {[
                    constraintsSummary!.pace && t(`tripModal.${constraintsSummary!.pace}`),
                    constraintsSummary!.has_children && t('tripDetail.withChildren'),
                    constraintsSummary!.preferences?.trim(),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {membersCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {membersCount}{' '}
                  {membersCount === 1 ? t('tripDetail.member') : t('tripDetail.members')}
                </p>
              )}
            </div>
          )}
          {(totalSpentCents > 0 || budgetCents != null) && (
            <div
              className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                overBudget
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('tripDetail.expensesCumulative')}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {spentFormatted} {currency}
                {budgetFormatted != null && (
                  <span
                    className={
                      overBudget
                        ? ' text-red-600 dark:text-red-400'
                        : ' text-gray-500 dark:text-gray-400'
                    }
                  >
                    {' '}
                    / {budgetFormatted} {currency}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sticky bar on desktop when scrolling (below header + tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:sticky md:top-44 md:z-10 md:py-3 md:-mx-4 md:px-4 lg:-mx-6 lg:px-6 md:bg-white dark:md:bg-gray-900 md:border-b md:border-gray-200 dark:md:border-gray-700 md:shadow-sm">
        <div
          className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1"
          role="tablist"
          aria-label={t('tripDetail.itinerary')}
        >
          {viewTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={viewMode === id}
              onClick={() => {
                setViewMode(id);
                setSelectedDate(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        {canEdit && (
          <button
            onClick={onAddActivity}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center shadow-sm w-fit"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('tripDetail.addActivity')}
          </button>
        )}
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t('tripDetail.noActivitiesYet')}</p>
          {canEdit && (
            <button
              onClick={onAddActivity}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('tripDetail.addFirstActivity')}
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <ItineraryDayBlock
              key={date}
              date={date}
              activities={activitiesByDate[date]}
              canVote={canVote}
              votingActivityId={votingActivityId}
              getVoteCounts={getVoteCounts}
              getUserVote={getUserVote}
              onVote={onVote}
              t={t}
              currency={currency}
              tripMembersCount={membersCount}
              activityParticipantsMap={activityParticipantsMap}
              tripMembers={tripMembers}
              memberProfiles={memberProfiles}
            />
          ))}
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="space-y-6">
          <TripWeekGrid
            startDate={startDate}
            endDate={endDate}
            activitiesByDate={activitiesByDate}
            selectedDate={selectedDate}
            onSelectDay={setSelectedDate}
            t={t}
          />
          {selectedDate && activitiesByDate[selectedDate]?.length > 0 && (
            <ItineraryDayBlock
              date={selectedDate}
              activities={activitiesByDate[selectedDate]}
              canVote={canVote}
              votingActivityId={votingActivityId}
              getVoteCounts={getVoteCounts}
              getUserVote={getUserVote}
              onVote={onVote}
              t={t}
              currency={currency}
              tripMembersCount={membersCount}
              activityParticipantsMap={activityParticipantsMap}
              tripMembers={tripMembers}
              memberProfiles={memberProfiles}
              showClose
              onClose={() => setSelectedDate(null)}
            />
          )}
        </div>
      ) : (
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
          />
        </div>
      )}
    </div>
  );
}
