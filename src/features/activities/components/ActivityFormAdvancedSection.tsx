import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ActivityFormData } from '../types';

interface ActivityFormAdvancedSectionProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityFormAdvancedSection({
  formData,
  onChange,
}: ActivityFormAdvancedSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('activityModal.latitude')}
          </label>
          <input
            type="number"
            step="any"
            value={formData.lat}
            onChange={(e) => onChange({ lat: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder={t('activityModal.latitudePlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('activityModal.longitude')}
          </label>
          <input
            type="number"
            step="any"
            value={formData.lon}
            onChange={(e) => onChange({ lon: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder={t('activityModal.longitudePlaceholder')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.status')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['proposed', 'confirmed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ status })}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                formData.status === status
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {t(`activityModal.${status}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
