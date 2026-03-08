import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';

import type { StepProps } from './types';
import { PACE_ICONS } from './types';

export function StepStyle({ formData, onChange }: StepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 py-2">
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
          {t('tripModal.travelPace')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['relaxed', 'balanced', 'packed'] as const).map((pace) => {
            const Icon = PACE_ICONS[pace];
            return (
              <button
                key={pace}
                type="button"
                onClick={() => onChange({ pace })}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-medium transition-all ${
                  formData.pace === pace
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm'
                    : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{t(`tripModal.${pace}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1.5 text-violet-500" />
          {t('tripModal.budgetPerPerson')}{' '}
          <span className="font-normal text-stone-400">({t('tripModal.optional')})</span>
        </label>
        <div className="flex gap-2">
          <select
            value={formData.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="px-3 py-3 border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:border-violet-500 focus:ring-0 transition-colors"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="CAD">CAD</option>
          </select>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => onChange({ budget: e.target.value })}
            className="flex-1 px-4 py-3 border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-xl focus:border-violet-500 focus:ring-0 transition-colors"
            placeholder={t('tripModal.budgetPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
}
