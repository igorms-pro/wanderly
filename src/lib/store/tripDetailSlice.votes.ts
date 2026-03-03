import type { Vote } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';

export function createTripDetailVotesSlice(set: SetState, get: GetState): Partial<AppState> {
  return {
    votes: {},
    setVotes: (votes) => set({ votes }),

    loadVotes: async (activityIds) => {
      try {
        if (activityIds.length === 0) {
          set({ votes: {} });
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          set({ votes: {} });
          return;
        }

        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .in('activity_id', activityIds);

        if (votesError) {
          console.error('Error loading votes:', votesError);
          throw votesError;
        }

        const votesByActivity: Record<string, Vote[]> = {};
        ((votesData || []) as any[]).forEach((vote: any) => {
          if (!votesByActivity[vote.activity_id]) votesByActivity[vote.activity_id] = [];
          votesByActivity[vote.activity_id].push({
            id: vote.id,
            activity_id: vote.activity_id,
            user_id: vote.user_id,
            choice: vote.choice,
            created_at: vote.created_at,
          });
        });

        set((state) => ({ votes: { ...state.votes, ...votesByActivity } }));
      } catch (error) {
        console.error('Error loading votes:', error);
        throw error;
      }
    },

    createOrUpdateVote: async (activityId, choice) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: vote, error } = await supabase
          .from('votes')
          .upsert({ activity_id: activityId, user_id: user.id, choice } as any, {
            onConflict: 'activity_id,user_id',
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating/updating vote:', error);
          throw error;
        }
        if (!vote) throw new Error('Failed to create/update vote');

        const vdb = vote as any;
        const mappedVote: Vote = {
          id: vdb.id,
          activity_id: vdb.activity_id,
          user_id: vdb.user_id,
          choice: vdb.choice,
          created_at: vdb.created_at,
        };

        set((state) => {
          const activityVotes = state.votes[activityId] || [];
          const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
          return {
            votes: {
              ...state.votes,
              [activityId]: [...filteredVotes, mappedVote],
            },
          };
        });
      } catch (error) {
        console.error('Error creating/updating vote:', error);
        throw error;
      }
    },
  };
}
