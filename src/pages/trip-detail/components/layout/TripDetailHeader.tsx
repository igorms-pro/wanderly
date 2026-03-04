import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export function TripDetailHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-16">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="ml-2 text-sm font-medium hidden sm:inline">
              {t('tripDetail.backToDashboard')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
