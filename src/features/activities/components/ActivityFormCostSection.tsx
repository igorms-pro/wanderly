import { DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ActivityFormData } from '../types';

interface ActivityFormCostSectionProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityFormCostSection({ formData, onChange }: ActivityFormCostSectionProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <DollarSign className="w-4 h-4 inline mr-1" />
        {t('activityModal.costPerPerson')}
      </label>
      <div className="flex flex-wrap gap-2 items-start">
        <select
          value={formData.currency}
          onChange={(e) => onChange({ currency: e.target.value })}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.costMin}
          onChange={(e) => onChange({ costMin: e.target.value })}
          className="flex-1 min-w-[100px] px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.costMinPlaceholder')}
          aria-label={t('activityModal.costMin')}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.costMax}
          onChange={(e) => onChange({ costMax: e.target.value })}
          className="flex-1 min-w-[100px] px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.costMaxPlaceholder')}
          aria-label={t('activityModal.costMax')}
        />
      </div>
    </div>
  );
}
