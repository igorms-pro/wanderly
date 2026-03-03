import { Plus, List, Calendar, Map } from 'lucide-react';

interface ItineraryViewTabsProps {
  t: (key: string) => string;
  canEdit: boolean;
  viewMode: 'list' | 'calendar' | 'timeline';
  onChangeViewMode: (mode: 'list' | 'calendar' | 'timeline') => void;
  onAddActivity: () => void;
}

export function ItineraryViewTabs({
  t,
  canEdit,
  viewMode,
  onChangeViewMode,
  onAddActivity,
}: ItineraryViewTabsProps) {
  const viewTabs: { id: 'list' | 'calendar' | 'timeline'; label: string; icon: typeof List }[] = [
    { id: 'list', label: t('tripDetail.itineraryViewList'), icon: List },
    { id: 'calendar', label: t('tripDetail.itineraryViewCalendar'), icon: Calendar },
    { id: 'timeline', label: t('tripDetail.itineraryViewVoyage'), icon: Map },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-16 sm:top-20 z-20 py-2 -mx-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
            onClick={() => onChangeViewMode(id)}
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
  );
}
