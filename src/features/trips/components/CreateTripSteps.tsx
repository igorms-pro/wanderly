import { useTranslation } from 'react-i18next';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Baby,
  Zap,
  Coffee,
  Gauge,
  Check,
  Compass,
} from 'lucide-react';

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  hasChildren: boolean;
  pace: 'relaxed' | 'balanced' | 'packed';
  budget: string;
  currency: string;
  interests: string[];
}

interface StepProps {
  formData: TripFormData;
  onChange: (updates: Partial<TripFormData>) => void;
  fieldErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

const INTEREST_OPTIONS = [
  { key: 'cultureMuseums', emoji: '🏛️' },
  { key: 'foodDining', emoji: '🍽️' },
  { key: 'natureOutdoors', emoji: '🌿' },
  { key: 'adventure', emoji: '🧗' },
  { key: 'shopping', emoji: '🛍️' },
  { key: 'nightlife', emoji: '🌙' },
  { key: 'history', emoji: '📜' },
  { key: 'relaxation', emoji: '🧘' },
];

const PACE_ICONS = { relaxed: Coffee, balanced: Gauge, packed: Zap };

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
