import { useCallback, useState } from 'react';

import { useStore } from '@/lib/store';
import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';

interface UseTripScenariosResult {
  scenarios: TripScenario[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (title: string | null, days: { date: string; dayIndex?: number }[]) => Promise<void>;
  remove: (scenarioId: string) => Promise<void>;
}

export function useTripScenarios(tripId: string | undefined): UseTripScenariosResult {
  const scenarios = useStore((s) => s.scenarios);
  const loadScenarios = useStore((s) => s.loadScenarios);
  const loadItineraryVotes = useStore((s) => s.loadItineraryVotes);
  const createScenario = useStore((s) => s.createScenario);
  const deleteScenario = useStore((s) => s.deleteScenario);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tripId) return;
    setError(null);
    setLoading(true);
    try {
      await loadScenarios(tripId);
      const itineraryIds = useStore.getState().scenarios.map((s) => s.id);
      await loadItineraryVotes(itineraryIds);
    } catch (err: any) {
      console.error('Error loading scenarios:', err);
      setError(err.message || 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }, [loadItineraryVotes, loadScenarios, tripId]);

  const create = useCallback(
    async (title: string | null, days: { date: string; dayIndex?: number }[]) => {
      if (!tripId) return;
      setError(null);
      try {
        await createScenario(tripId, { title, days });
      } catch (err: any) {
        console.error('Error creating scenario:', err);
        setError(err.message || 'Failed to create scenario');
      }
    },
    [createScenario, tripId],
  );

  const remove = useCallback(
    async (scenarioId: string) => {
      setError(null);
      try {
        await deleteScenario(scenarioId);
      } catch (err: any) {
        console.error('Error deleting scenario:', err);
        setError(err.message || 'Failed to delete scenario');
      }
    },
    [deleteScenario],
  );

  return {
    scenarios,
    loading,
    error,
    load,
    create,
    remove,
  };
}
