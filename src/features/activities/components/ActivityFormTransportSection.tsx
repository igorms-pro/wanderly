import { Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ActivityFormData } from '../types';

const TRANSPORT_TYPES = ['car', 'taxi', 'walking', 'bus', 'metro', 'plane'] as const;

interface ActivityFormTransportSectionProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityFormTransportSection({
  formData,
  onChange,
}: ActivityFormTransportSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Car className="w-4 h-4" />
        {t('activityModal.transportLabel')}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('activityModal.transportType')}
          </label>
          <select
            value={formData.transportType}
            onChange={(e) => onChange({ transportType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            aria-label={t('activityModal.transportType')}
          >
            <option value="">{t('tripDetail.transportNotSet')}</option>
            {TRANSPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`tripDetail.transport${type.charAt(0).toUpperCase()}${type.slice(1)}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('activityModal.transportDurationMinutes')}
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={formData.transportDurationMinutes}
            onChange={(e) => onChange({ transportDurationMinutes: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder={t('activityModal.transportDurationPlaceholder')}
            aria-label={t('activityModal.transportDurationMinutes')}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.transportNotes')}
        </label>
        <input
          type="text"
          value={formData.transportNotes}
          onChange={(e) => onChange({ transportNotes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.transportNotesPlaceholder')}
          aria-label={t('activityModal.transportNotes')}
        />
      </div>
    </div>
  );
}
