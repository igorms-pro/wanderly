import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDuplicateTrip } from '../hooks/useTripTemplates';
import { tripDurationDays } from '../lib/shiftTripDates';

type DuplicateTripModalProps = {
  sourceTripId: string;
  sourceTitle: string;
  sourceStartDate: string;
  sourceEndDate: string;
  userId: string;
  onClose: () => void;
  onDuplicated: (tripId: string) => void;
};

export function DuplicateTripModal({
  sourceTripId,
  sourceTitle,
  sourceStartDate,
  sourceEndDate,
  userId,
  onClose,
  onDuplicated,
}: DuplicateTripModalProps) {
  const { t } = useTranslation();
  const { duplicate, duplicating, error } = useDuplicateTrip(userId);
  const duration = tripDurationDays(sourceStartDate, sourceEndDate);
  const [title, setTitle] = useState(`${sourceTitle} (${t('sharing.copySuffix')})`);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleStartChange = (value: string) => {
    setStartDate(value);
    if (value) {
      const start = new Date(`${value}T00:00:00Z`);
      start.setUTCDate(start.getUTCDate() + duration - 1);
      setEndDate(start.toISOString().slice(0, 10));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      setFieldError(t('sharing.duplicateFieldsRequired'));
      return;
    }
    if (endDate < startDate) {
      setFieldError(t('errors.invalidDates'));
      return;
    }
    setFieldError(null);
    const trip = await duplicate(sourceTripId, {
      title: title.trim(),
      start_date: startDate,
      end_date: endDate,
    });
    onDuplicated(trip.id);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full"
        role="dialog"
        aria-labelledby="duplicate-trip-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-violet-500" aria-hidden />
            <h2 id="duplicate-trip-title" className="text-lg font-bold">
              {t('sharing.duplicateTrip')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px]"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t('sharing.duplicateDescription')}
          </p>
          <label className="block text-sm font-medium">
            {t('sharing.duplicateTitle')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[44px] dark:bg-stone-800 dark:border-stone-600"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">
              {t('sharing.startDate')}
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartChange(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[44px] dark:bg-stone-800 dark:border-stone-600"
              />
            </label>
            <label className="block text-sm font-medium">
              {t('sharing.endDate')}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[44px] dark:bg-stone-800 dark:border-stone-600"
              />
            </label>
          </div>
          {fieldError ? <p className="text-sm text-rose-600">{fieldError}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={duplicating} className="w-full">
            {duplicating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t('sharing.duplicateConfirm')}
          </Button>
        </div>
      </form>
    </div>
  );
}
