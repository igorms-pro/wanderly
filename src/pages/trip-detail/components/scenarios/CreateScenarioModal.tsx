import { useState } from 'react';

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  dates: string[];
  onCreate: (title: string | null, days: { date: string; dayIndex?: number }[]) => void;
  t: (key: string) => string;
}

export function CreateScenarioModal({
  isOpen,
  onClose,
  dates,
  onCreate,
  t,
}: CreateScenarioModalProps) {
  const [title, setTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const days = selectedDates
      .slice()
      .sort()
      .map((date, index) => ({ date, dayIndex: index + 1 }));
    onCreate(title.trim() || null, days);
    setTitle('');
    setSelectedDates([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {t('tripDetail.createScenarioTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('tripDetail.createScenarioDescription')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('tripDetail.scenarioNameLabel')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tripDetail.scenarioNamePlaceholder')}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('tripDetail.scenarioDaysLabel')}
            </p>
            {dates.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tripDetail.scenarioNoDates')}
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 p-2 space-y-1.5">
                {dates.map((date) => (
                  <label
                    key={date}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDates.includes(date)}
                      onChange={() => toggleDate(date)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{date}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={dates.length === 0 || selectedDates.length === 0}
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {t('tripDetail.createScenarioCta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
