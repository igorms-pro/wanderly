import { useTranslation } from 'react-i18next';
import { Calendar, MapPin } from 'lucide-react';

import type { StepProps } from './types';

export function StepDestination({ formData, onChange, fieldErrors = {}, onClearError }: StepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 py-2">
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-1.5 text-violet-500" />
          {t('tripModal.destination')}
        </label>
        <input
          type="text"
          value={formData.destination}
          onChange={(e) => {
            onChange({ destination: e.target.value });
            onClearError?.('destination');
          }}
          className={`w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-0 transition-colors ${
            fieldErrors.destination
              ? 'border-red-400 focus:border-red-500'
              : 'border-stone-200 dark:border-stone-700 focus:border-violet-500'
          }`}
          placeholder={t('tripModal.destinationPlaceholder')}
          autoFocus
        />
        {fieldErrors.destination && (
          <p className="text-xs text-red-500 mt-1.5">{fieldErrors.destination}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1.5 text-violet-500" />
            {t('tripModal.startDate')}
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              onChange({ startDate: e.target.value });
              onClearError?.('dates');
            }}
            className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:border-violet-500 focus:ring-0 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t('tripModal.endDate')}
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => {
              onChange({ endDate: e.target.value });
              onClearError?.('dates');
            }}
            min={formData.startDate}
            className="w-full px-4 py-3 border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:border-violet-500 focus:ring-0 transition-colors"
          />
        </div>
      </div>
      {fieldErrors.dates && <p className="text-xs text-red-500 -mt-2">{fieldErrors.dates}</p>}
    </div>
  );
}
