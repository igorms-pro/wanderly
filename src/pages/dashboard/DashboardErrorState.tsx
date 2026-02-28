import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

interface DashboardErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function DashboardErrorState({ message, onRetry }: DashboardErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          {t('dashboard.errorLoadingTrips')}
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition"
        >
          {t('trip.tryAgain')}
        </button>
      </div>
    </div>
  );
}
