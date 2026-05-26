import type { Activity } from '@/lib/types/database.types';
import { getAiConstraintsHintLevel } from '@/lib/ai/tripConstraintsHint';

import { TripScenariosSection } from '../scenarios/TripScenariosSection';
import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';
import type { ConstraintsSummary } from './TripDetailItinerary';

interface TripDetailItineraryScenariosProps {
  scenarios: TripScenario[];
  sortedDates: string[];
  canCreate: boolean;
  canGenerateAiScenario: boolean;
  maxAiScenariosPerTrip: number;
  canManage: boolean;
  canVoteScenario: boolean;
  votingScenarioId: string | null;
  winningScenarioIds: string[];
  getScenarioVoteCounts: (itineraryId: string) => { upvotes: number; downvotes: number };
  getUserScenarioVote: (itineraryId: string) => 'up' | 'down' | null;
  onScenarioVote: (itineraryId: string, choice: 'up' | 'down') => void;
  budgetCents?: number | null;
  constraintsSummary?: ConstraintsSummary | null;
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
  canGenerateAiScenario,
  maxAiScenariosPerTrip,
  canManage,
  canVoteScenario,
  votingScenarioId,
  winningScenarioIds,
  getScenarioVoteCounts,
  getUserScenarioVote,
  onScenarioVote,
  budgetCents = null,
  constraintsSummary,
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

  const aiConstraintsHintLevel = getAiConstraintsHintLevel(constraintsSummary, budgetCents);
  const aiScenarioCount = scenarios.filter((s) => s.isAiGenerated).length;

  return (
    <TripScenariosSection
      scenarios={scenarios}
      sortedDates={sortedDates}
      canCreate={canCreate}
      canGenerateAiScenario={canGenerateAiScenario}
      maxAiScenariosPerTrip={maxAiScenariosPerTrip}
      canManage={canManage}
      canVoteScenario={canVoteScenario}
      votingScenarioId={votingScenarioId}
      winningScenarioIds={winningScenarioIds}
      getScenarioVoteCounts={getScenarioVoteCounts}
      getUserScenarioVote={getUserScenarioVote}
      onScenarioVote={onScenarioVote}
      onGenerateAiScenario={onGenerateAiScenario}
      onCreateScenario={onCreateScenario}
      onDeleteScenario={onDeleteScenario}
      onUseScenarioAsBase={onUseScenarioAsBase}
      onAddScenarioActivityToItinerary={onAddScenarioActivityToItinerary}
      constraintsHintLevel={aiConstraintsHintLevel}
      aiScenarioCount={aiScenarioCount}
      t={t}
    />
  );
}
