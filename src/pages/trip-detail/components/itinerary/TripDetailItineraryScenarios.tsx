import type { Activity } from '@/lib/types/database.types';

import { TripScenariosSection } from '../scenarios/TripScenariosSection';
import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';

interface TripDetailItineraryScenariosProps {
  scenarios: TripScenario[];
  sortedDates: string[];
  canCreate: boolean;
  canManage: boolean;
  t: (key: string) => string;
  onGenerateAiScenario?: () => Promise<void>;
  onCreateScenario?: (title: string | null, days: { date: string; dayIndex?: number }[]) => void;
  onDeleteScenario?: (scenarioId: string) => void;
  onUseScenarioAsBase?: (scenarioItineraryId: string) => Promise<void>;
  onAddScenarioActivityToItinerary?: (date: string, activity: Activity) => Promise<void>;
}

export function TripDetailItineraryScenarios({
  scenarios,
  sortedDates,
  canCreate,
  canManage,
  t,
  onGenerateAiScenario,
  onCreateScenario,
  onDeleteScenario,
  onUseScenarioAsBase,
  onAddScenarioActivityToItinerary,
}: TripDetailItineraryScenariosProps) {
  if (
    !onCreateScenario ||
    !onDeleteScenario ||
    !onGenerateAiScenario ||
    !onUseScenarioAsBase ||
    !onAddScenarioActivityToItinerary
  ) {
    return null;
  }

  return (
    <TripScenariosSection
      scenarios={scenarios}
      sortedDates={sortedDates}
      canCreate={canCreate}
      canManage={canManage}
      onGenerateAiScenario={onGenerateAiScenario}
      onCreateScenario={onCreateScenario}
      onDeleteScenario={onDeleteScenario}
      onUseScenarioAsBase={onUseScenarioAsBase}
      onAddScenarioActivityToItinerary={onAddScenarioActivityToItinerary}
      t={t}
    />
  );
}
