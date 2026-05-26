import { useTranslation } from 'react-i18next';
import { Users, Baby } from 'lucide-react';

import type { StepProps } from './types';

export function StepTravelers({ formData, onChange }: StepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 py-2">
      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
          <Users className="w-4 h-4 inline mr-1.5 text-violet-500" />
          {t('tripModal.groupSize')}
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange({ groupSize: Math.max(1, formData.groupSize - 1) })}
            className="w-12 h-12 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-violet-400 flex items-center justify-center text-xl font-bold transition-colors"
          >
            −
          </button>
          <span className="text-4xl font-bold text-stone-900 dark:text-stone-100 w-16 text-center tabular-nums">
            {formData.groupSize}
          </span>
          <button
            type="button"
            onClick={() => onChange({ groupSize: Math.min(20, formData.groupSize + 1) })}
            className="w-12 h-12 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-violet-400 flex items-center justify-center text-xl font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
          <Baby className="w-4 h-4 inline mr-1.5 text-violet-500" />
          {t('tripModal.childrenPresent')}
        </label>
        <div className="flex gap-3">
          {[false, true].map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => onChange({ hasChildren: val })}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                formData.hasChildren === val
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
              }`}
            >
              {val ? t('tripModal.childrenYes') : t('tripModal.childrenNo')}
            </button>
          ))}
        </div>
        {formData.hasChildren && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            {t('tripModal.childrenHint')}
          </p>
        )}
      </div>
    </div>
  );
}
