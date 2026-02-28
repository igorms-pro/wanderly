import { useTranslation } from 'react-i18next';

export function DashboardLoadingState() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-700" />
          <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-stone-500 dark:text-stone-400 font-medium">
          {t('dashboard.loadingTrips')}
        </p>
      </div>
    </div>
  );
}
