import { useTranslation } from 'react-i18next';
import { Plus, Plane } from 'lucide-react';

interface DashboardEmptyStateProps {
  hasTrips: boolean;
  onCreateTrip: () => void;
}

export function DashboardEmptyState({ hasTrips, onCreateTrip }: DashboardEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/50 dark:border-stone-800/50 p-16 text-center">
      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
        <Plane className="w-12 h-12 text-violet-500" />
      </div>
      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
        {hasTrips ? t('trip.noTripsMatch') : t('trip.noTripsYet')}
      </h3>
      <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-sm mx-auto">
        {hasTrips ? t('trip.tryAdjustingFilters') : t('trip.getStartedMessage')}
      </p>
      {!hasTrips && (
        <button
          onClick={onCreateTrip}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          {t('trip.createFirstTrip')}
        </button>
      )}
    </div>
  );
}
