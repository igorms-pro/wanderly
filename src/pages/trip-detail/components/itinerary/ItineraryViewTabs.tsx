import { Plus, List, Calendar, Map, Search, ClipboardCheck } from 'lucide-react';

import type { ItineraryViewMode } from './TripDetailItinerary';

interface ItineraryViewTabsProps {
  t: (key: string) => string;
  canEdit: boolean;
  viewMode: ItineraryViewMode;
  onChangeViewMode: (mode: ItineraryViewMode) => void;
  onAddActivity: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const VIEW_TAB_DEFS: { id: ItineraryViewMode; key: string; icon: typeof List }[] = [
  { id: 'list', key: 'tripDetail.itineraryViewList', icon: List },
  { id: 'calendar', key: 'tripDetail.itineraryViewCalendar', icon: Calendar },
  { id: 'timeline', key: 'tripDetail.itineraryViewVoyage', icon: Map },
  { id: 'decision', key: 'tripDetail.itineraryViewDecision', icon: ClipboardCheck },
];

export function ItineraryViewTabs({
  t,
  canEdit,
  viewMode,
  onChangeViewMode,
  onAddActivity,
  searchQuery,
  onSearchChange,
}: ItineraryViewTabsProps) {
  return (
    <div className="flex flex-col gap-3 sticky top-[10rem] sm:top-[11rem] z-10 py-2 -mx-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1 w-fit"
          role="tablist"
          aria-label={t('tripDetail.itinerary')}
        >
          {VIEW_TAB_DEFS.map(({ id, key, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={viewMode === id}
              onClick={() => onChangeViewMode(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(key)}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center flex-1 sm:flex-initial sm:min-w-[200px]">
          <div className="relative flex-1 sm:min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('tripDetail.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              aria-label={t('tripDetail.searchPlaceholder')}
            />
          </div>
          {canEdit && (
            <button
              onClick={onAddActivity}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center shadow-sm w-fit shrink-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('tripDetail.addActivity')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
