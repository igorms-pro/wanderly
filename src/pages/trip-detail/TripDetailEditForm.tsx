import { Coffee, Zap, Gauge, DollarSign, Baby, Save, X } from 'lucide-react';
import type { EditFormState } from './TripDetailHero';

const PACE_ICONS = { relaxed: Coffee, balanced: Gauge, packed: Zap };
const PACE_OPTIONS: ('relaxed' | 'balanced' | 'packed')[] = ['relaxed', 'balanced', 'packed'];

interface TripDetailEditFormProps {
  editForm: EditFormState;
  setEditForm: (f: EditFormState | ((prev: EditFormState) => EditFormState)) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  t: (key: string) => string;
}

const inputClass =
  'w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white min-h-[44px]';

export function TripDetailEditForm({
  editForm,
  setEditForm,
  onSave,
  onCancel,
  t,
}: TripDetailEditFormProps) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editForm.title}
        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
        className={inputClass}
        placeholder={t('tripDetail.tripTitlePlaceholder')}
        aria-label={t('tripDetail.tripTitlePlaceholder')}
      />
      <input
        type="text"
        value={editForm.destination_text}
        onChange={(e) => setEditForm({ ...editForm, destination_text: e.target.value })}
        className={inputClass}
        placeholder={t('tripDetail.destinationPlaceholder')}
        aria-label={t('tripDetail.destinationPlaceholder')}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={editForm.start_date}
          onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
          className={inputClass}
          aria-label="Start date"
        />
        <input
          type="date"
          value={editForm.end_date}
          onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
          min={editForm.start_date}
          className={inputClass}
          aria-label="End date"
        />
      </div>

      {/* Pace */}
      <div>
        <p className="text-white/90 text-sm font-medium mb-2">{t('tripModal.travelPace')}</p>
        <div className="grid grid-cols-3 gap-2">
          {PACE_OPTIONS.map((pace) => {
            const Icon = PACE_ICONS[pace];
            return (
              <button
                key={pace}
                type="button"
                onClick={() => setEditForm({ ...editForm, pace })}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 min-h-[44px] transition ${
                  editForm.pace === pace
                    ? 'border-white bg-white/30 text-white'
                    : 'border-white/30 text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{t(`tripModal.${pace}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-white/90 text-sm font-medium mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          {t('tripModal.budgetPerPerson')} ({t('tripModal.optional')})
        </p>
        <div className="flex gap-2">
          <select
            value={editForm.currency}
            onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
            className={`flex-shrink-0 w-24 ${inputClass}`}
            aria-label="Currency"
          >
            <option value="USD" className="text-stone-900">
              USD
            </option>
            <option value="EUR" className="text-stone-900">
              EUR
            </option>
            <option value="GBP" className="text-stone-900">
              GBP
            </option>
            <option value="JPY" className="text-stone-900">
              JPY
            </option>
            <option value="CAD" className="text-stone-900">
              CAD
            </option>
          </select>
          <input
            type="number"
            min={0}
            value={editForm.budget}
            onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
            className={inputClass}
            placeholder={t('tripModal.budgetPlaceholder')}
            aria-label={t('tripModal.budgetPerPerson')}
          />
        </div>
      </div>

      {/* With children */}
      <label className="flex items-center gap-2 cursor-pointer text-white/90">
        <input
          type="checkbox"
          checked={editForm.has_children}
          onChange={(e) => setEditForm({ ...editForm, has_children: e.target.checked })}
          className="w-5 h-5 rounded border-white/30 bg-white/20 text-blue-600 focus:ring-white"
        />
        <Baby className="w-4 h-4" />
        <span>{t('tripDetail.withChildren')}</span>
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onSave}
          className="px-4 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center min-h-[44px]"
        >
          <Save className="w-4 h-4 mr-2" />
          {t('tripDetail.save')}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition flex items-center min-h-[44px]"
        >
          <X className="w-4 h-4 mr-2" />
          {t('tripDetail.cancel')}
        </button>
      </div>
    </div>
  );
}
