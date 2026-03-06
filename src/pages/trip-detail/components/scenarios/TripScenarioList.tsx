import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';

interface TripScenarioListProps {
  scenarios: TripScenario[];
  canManage: boolean;
  onDelete: (scenarioId: string) => void;
  onPreview: (scenarioId: string) => void;
  t: (key: string) => string;
}

export function TripScenarioList({
  scenarios,
  canManage,
  onDelete,
  onPreview,
  t,
}: TripScenarioListProps) {
  if (scenarios.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('tripDetail.noScenariosYet')}</p>
    );
  }

  return (
    <ul className="space-y-2">
      {scenarios.map((scenario) => (
        <li
          key={scenario.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {scenario.title || t('tripDetail.untitledScenario')}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {t('tripDetail.scenarioDays')}
              {scenario.isAiGenerated ? ` · ${t('tripDetail.scenarioAiBadge')}` : ''}
            </p>
          </div>
          <div className="ml-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onPreview(scenario.id)}
              className="text-xs text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100"
            >
              {t('tripDetail.previewScenario')}
            </button>
            {canManage && (
              <button
                type="button"
                onClick={() => onDelete(scenario.id)}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {t('tripDetail.deleteScenario')}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
