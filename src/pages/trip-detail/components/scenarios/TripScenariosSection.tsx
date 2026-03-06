import { useState } from 'react';

import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';
import { TripScenarioList } from './TripScenarioList';
import { CreateScenarioModal } from './CreateScenarioModal';

interface TripScenariosSectionProps {
  scenarios: TripScenario[];
  sortedDates: string[];
  canCreate: boolean;
  canManage: boolean;
  onCreateScenario: (title: string | null, days: { date: string; dayIndex?: number }[]) => void;
  onDeleteScenario: (scenarioId: string) => void;
  t: (key: string) => string;
}

export function TripScenariosSection({
  scenarios,
  sortedDates,
  canCreate,
  canManage,
  onCreateScenario,
  onDeleteScenario,
  t,
}: TripScenariosSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('tripDetail.scenariosSectionTitle')}
        </h3>
        {canCreate && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            {t('tripDetail.addScenario')}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {t('tripDetail.scenariosSectionDescription')}
      </p>

      <TripScenarioList
        scenarios={scenarios}
        canManage={canManage}
        onDelete={onDeleteScenario}
        t={t}
      />

      <CreateScenarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dates={sortedDates}
        onCreate={onCreateScenario}
        t={t}
      />
    </section>
  );
}
