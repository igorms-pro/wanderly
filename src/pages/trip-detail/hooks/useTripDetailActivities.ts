import { useCallback, useMemo, useState } from 'react';

import { useStore } from '@/lib/store';
import type { Activity, Vote } from '@/lib/types/database.types';
import { groupActivitiesByDate } from './itinerary-utils';
import { supabase } from '@/lib/supabase';

interface UseTripDetailActivitiesResult {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
  votingActivityId: string | null;
  handleVote: (activityId: string, choice: 'up' | 'down') => Promise<void>;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
}

export function useTripDetailActivities(t: (key: string) => string): UseTripDetailActivitiesResult {
  const user = useStore((state) => state.user);
  const activities = useStore((state) => state.activities);
  const votes = useStore((state) => state.votes);
  const setVotes = useStore((state) => state.setVotes);
  const createOrUpdateVote = useStore((state) => state.createOrUpdateVote);

  const [votingActivityId, setVotingActivityId] = useState<string | null>(null);

  const activitiesByDate = useMemo(() => groupActivitiesByDate(activities), [activities]);

  const sortedDates = useMemo(() => Object.keys(activitiesByDate).sort(), [activitiesByDate]);

  const getUserVote = useCallback(
    (activityId: string): 'up' | 'down' | null => {
      if (!user) return null;
      const activityVotes = votes[activityId] || [];
      const userVote = activityVotes.find((v) => v.user_id === user.id);
      return userVote ? userVote.choice : null;
    },
    [user, votes],
  );

  const getVoteCounts = useCallback(
    (activityId: string) => {
      const activityVotes = votes[activityId] || [];
      const upvotes = activityVotes.filter((v) => v.choice === 'up').length;
      const downvotes = activityVotes.filter((v) => v.choice === 'down').length;
      return { upvotes, downvotes };
    },
    [votes],
  );

  const handleVote = useCallback(
    async (activityId: string, choice: 'up' | 'down') => {
      if (!user) {
        alert(t('errors.mustBeLoggedIn') || 'You must be logged in to vote');
        return;
      }
      setVotingActivityId(activityId);
      const currentVote = getUserVote(activityId);
      const isRemovingVote = currentVote === choice;
      const originalVotes = { ...votes };
      const activityVotes = votes[activityId] || [];

      try {
        if (isRemovingVote) {
          const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
          setVotes({ ...votes, [activityId]: filteredVotes });
          const userVote = activityVotes.find((v) => v.user_id === user.id);
          if (userVote) {
            const { error } = await supabase.from('votes').delete().eq('id', userVote.id);
            if (error) throw error;
          }
        } else {
          const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
          const optimisticVote: Vote = {
            id: `temp-${Date.now()}`,
            activity_id: activityId,
            user_id: user.id,
            choice,
            created_at: new Date().toISOString(),
          };
          setVotes({ ...votes, [activityId]: [...filteredVotes, optimisticVote] });
          await createOrUpdateVote(activityId, choice);
        }
      } catch (err: any) {
        console.error('Error voting:', err);
        setVotes(originalVotes);
        alert(err.message || t('errors.failedToVote') || 'Failed to vote. Please try again.');
      } finally {
        setVotingActivityId(null);
      }
    },
    [createOrUpdateVote, getUserVote, t, user, votes, setVotes],
  );

  return {
    activitiesByDate,
    sortedDates,
    votingActivityId,
    handleVote,
    getVoteCounts,
    getUserVote,
  };
}
