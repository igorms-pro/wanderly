import { useCallback, useMemo, useState } from 'react';

import { useStore } from '@/lib/store';
import type { TripScenario } from '@/lib/store/tripDetailSlice.scenarios';
import type { ItineraryVote } from '@/lib/types/database.types';
import { supabase } from '@/lib/supabase';

interface UseTripDetailScenarioVotesResult {
  votingScenarioId: string | null;
  handleScenarioVote: (itineraryId: string, choice: 'up' | 'down') => Promise<void>;
  getScenarioVoteCounts: (itineraryId: string) => { upvotes: number; downvotes: number };
  getUserScenarioVote: (itineraryId: string) => 'up' | 'down' | null;
  winningScenarioIds: string[];
}

export function useTripDetailScenarioVotes(
  t: (key: string) => string,
  scenarios: TripScenario[] | undefined,
  tripId: string | undefined,
): UseTripDetailScenarioVotesResult {
  const user = useStore((state) => state.user);
  const itineraryVotes = useStore((state) => state.itineraryVotes);
  const setItineraryVotes = useStore((state) => state.setItineraryVotes);
  const createOrUpdateItineraryVote = useStore((state) => state.createOrUpdateItineraryVote);

  const [votingScenarioId, setVotingScenarioId] = useState<string | null>(null);

  const getUserScenarioVote = useCallback(
    (itineraryId: string): 'up' | 'down' | null => {
      if (!user) return null;
      const list = itineraryVotes[itineraryId] || [];
      const mine = list.find((v) => v.user_id === user.id);
      return mine ? mine.choice : null;
    },
    [user, itineraryVotes],
  );

  const getScenarioVoteCounts = useCallback(
    (itineraryId: string) => {
      const list = itineraryVotes[itineraryId] || [];
      const upvotes = list.filter((v) => v.choice === 'up').length;
      const downvotes = list.filter((v) => v.choice === 'down').length;
      return { upvotes, downvotes };
    },
    [itineraryVotes],
  );

  const winningScenarioIds = useMemo(() => {
    const list = scenarios ?? [];
    if (list.length === 0) return [];
    let totalCast = 0;
    const nets = list.map((s) => {
      const list = itineraryVotes[s.id] ?? [];
      totalCast += list.length;
      const upvotes = list.filter((v) => v.choice === 'up').length;
      const downvotes = list.filter((v) => v.choice === 'down').length;
      return { id: s.id, net: upvotes - downvotes };
    });
    if (totalCast === 0) return [];
    const maxNet = Math.max(...nets.map((n) => n.net));
    return nets.filter((n) => n.net === maxNet).map((n) => n.id);
  }, [scenarios, itineraryVotes]);

  const handleScenarioVote = useCallback(
    async (itineraryId: string, choice: 'up' | 'down') => {
      if (!user) {
        alert(t('errors.mustBeLoggedIn'));
        return;
      }
      if (!tripId) return;

      setVotingScenarioId(itineraryId);
      const currentVote = getUserScenarioVote(itineraryId);
      const isRemovingVote = currentVote === choice;
      const original = { ...itineraryVotes };
      const list = itineraryVotes[itineraryId] || [];

      try {
        if (isRemovingVote) {
          const filtered = list.filter((v) => v.user_id !== user.id);
          setItineraryVotes({ ...itineraryVotes, [itineraryId]: filtered });
          const userVote = list.find((v) => v.user_id === user.id);
          if (userVote) {
            const { error } = await supabase.from('itinerary_votes').delete().eq('id', userVote.id);
            if (error) throw error;
          }
        } else {
          const filtered = list.filter((v) => v.user_id !== user.id);
          const optimistic: ItineraryVote = {
            id: `temp-${Date.now()}`,
            trip_id: tripId,
            itinerary_id: itineraryId,
            user_id: user.id,
            choice,
            created_at: new Date().toISOString(),
          };
          setItineraryVotes({ ...itineraryVotes, [itineraryId]: [...filtered, optimistic] });
          await createOrUpdateItineraryVote(tripId, itineraryId, choice);
        }
      } catch (err: unknown) {
        console.error('Error voting on scenario:', err);
        setItineraryVotes(original);
        const message = err instanceof Error ? err.message : t('errors.failedToVote');
        alert(message);
      } finally {
        setVotingScenarioId(null);
      }
    },
    [
      createOrUpdateItineraryVote,
      getUserScenarioVote,
      itineraryVotes,
      setItineraryVotes,
      t,
      tripId,
      user,
    ],
  );

  return {
    votingScenarioId,
    handleScenarioVote,
    getScenarioVoteCounts,
    getUserScenarioVote,
    winningScenarioIds,
  };
}
