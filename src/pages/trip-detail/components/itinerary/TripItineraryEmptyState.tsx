interface TripItineraryEmptyStateProps {
  t: (key: string) => string;
  canEdit: boolean;
  onAddActivity: () => void;
}

export function TripItineraryEmptyState({
  t,
  canEdit,
  onAddActivity,
}: TripItineraryEmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-12 text-center">
      <p className="text-gray-600 dark:text-gray-300 mb-4">{t('tripDetail.noActivitiesYet')}</p>
      {canEdit && (
        <button
          onClick={onAddActivity}
          className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition inline-flex items-center"
        >
          {t('tripDetail.addFirstActivity')}
        </button>
      )}
    </div>
  );
}
