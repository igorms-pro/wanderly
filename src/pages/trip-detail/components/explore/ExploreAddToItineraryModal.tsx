import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

type ExploreAddToItineraryModalProps = {
  isOpen: boolean;
  placeName: string;
  sortedDates: string[];
  locale: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
};

function formatTripDay(date: string, locale: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function ExploreAddToItineraryModal({
  isOpen,
  placeName,
  sortedDates,
  locale,
  loading,
  onClose,
  onConfirm,
}: ExploreAddToItineraryModalProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDate(sortedDates[0] ?? '');
  }, [isOpen, sortedDates]);

  const handleConfirm = (): void => {
    if (!selectedDate) return;
    onConfirm(selectedDate);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('tripDetail.exploreAddToItineraryTitle')}
      contentClassName="max-w-md"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            loading={loading}
            disabled={!selectedDate || sortedDates.length === 0}
            onClick={handleConfirm}
          >
            {t('tripDetail.addActivityToItinerary')}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-stone-600 dark:text-stone-300">
        {t('tripDetail.exploreAddToItinerarySubtitle', { place: placeName })}
      </p>

      {sortedDates.length === 0 ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {t('tripDetail.exploreAddToItineraryNoDays')}
        </p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="sr-only">{t('tripDetail.exploreAddToItineraryDayLabel')}</legend>
          {sortedDates.map((date) => (
            <label
              key={date}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                selectedDate === date
                  ? 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/20'
                  : 'border-stone-200 dark:border-stone-600'
              }`}
            >
              <input
                type="radio"
                name="explore-itinerary-day"
                value={date}
                checked={selectedDate === date}
                onChange={() => setSelectedDate(date)}
                className="h-4 w-4 accent-orange-600"
              />
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {formatTripDay(date, locale)}
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </Modal>
  );
}
