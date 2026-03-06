import type { Activity } from '@/lib/types/database.types';
import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';

interface ScenarioPreviewModalProps {
  scenario: TripScenario;
  isOpen: boolean;
  canManage: boolean;
  onClose: () => void;
  onUseAsBase: (scenarioItineraryId: string) => Promise<void>;
  onAddToItinerary: (date: string, activity: Activity) => Promise<void>;
  t: (key: string) => string;
}

function formatTime(value: string | null | undefined): string | null {
  if (!value) return null;
  // DB column is TIME => usually HH:MM:SS
  if (value.includes(':')) return value.slice(0, 5);
  return value;
}

export function ScenarioPreviewModal({
  scenario,
  isOpen,
  canManage,
  onClose,
  onUseAsBase,
  onAddToItinerary,
  t,
}: ScenarioPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 shadow-xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {scenario.title || t('tripDetail.untitledScenario')}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {scenario.isAiGenerated
                ? t('tripDetail.scenarioAiBadge')
                : t('tripDetail.scenarioHumanBadge')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={async () => onUseAsBase(scenario.id)}
                className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
              >
                {t('tripDetail.useScenarioAsBase')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t('tripDetail.close')}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {scenario.days.map((day) => (
            <section
              key={day.id}
              className="rounded-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {day.date}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">#{day.dayIndex}</div>
              </div>

              {day.activities.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {t('tripDetail.noActivitiesForDay')}
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  {day.activities.map((a) => {
                    const time = [formatTime(a.start_time), formatTime(a.end_time)]
                      .filter(Boolean)
                      .join('–');
                    return (
                      <li key={a.id} className="px-3 py-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {a.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {time ? `${time} · ` : ''}
                            {a.place_name || a.place_id || ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => onAddToItinerary(day.date, a)}
                          className="shrink-0 inline-flex items-center rounded-md bg-gray-900 dark:bg-gray-100 px-3 py-1.5 text-xs font-medium text-white dark:text-gray-900 hover:opacity-90"
                        >
                          {t('tripDetail.addActivityToItinerary')}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
