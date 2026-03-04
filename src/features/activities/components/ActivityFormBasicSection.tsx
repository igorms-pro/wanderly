import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ActivityFormData } from '../types';

const CATEGORY_OPTIONS = [
  'Restaurant',
  'Attraction',
  'Hotel',
  'Transport',
  'Activity',
  'Shopping',
  'Entertainment',
  'Nightlife',
  'Culture',
  'Nature',
  'Other',
] as const;

interface ActivityFormBasicSectionProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityFormBasicSection({ formData, onChange }: ActivityFormBasicSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.title')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.titlePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.descriptionPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          {t('activityModal.category')}
        </label>
        <select
          value={formData.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">{t('activityModal.selectCategory')}</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
