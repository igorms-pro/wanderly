import { useTranslation } from 'react-i18next';
import { Compass, Check } from 'lucide-react';

import type { StepProps } from './types';
import { INTEREST_OPTIONS } from './types';

export function StepInterests({ formData, onChange }: StepProps) {
  const { t } = useTranslation();

  const toggleInterest = (key: string) => {
    const current = formData.interests;
    onChange({
      interests: current.includes(key) ? current.filter((i) => i !== key) : [...current, key],
    });
  };

  return (
    <div className="space-y-4 py-2">
      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
        <Compass className="w-4 h-4 inline mr-1.5 text-violet-500" />
        {t('tripModal.interests')}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {INTEREST_OPTIONS.map(({ key, emoji }) => {
          const selected = formData.interests.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleInterest(key)}
              className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 shadow-sm'
                  : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm font-medium">{t(`tripModal.${key}`)}</span>
              {selected && <Check className="w-4 h-4 absolute top-2 right-2 text-violet-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
