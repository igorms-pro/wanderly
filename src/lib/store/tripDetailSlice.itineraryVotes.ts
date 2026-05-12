import type { ItineraryVote } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';

export function createTripDetailItineraryVotesSlice(
  set: SetState,
  _get: GetState,
): Partial<AppState> {
  return {
    itineraryVotes: {},
    setItineraryVotes: (itineraryVotes) => set({ itineraryVotes }),

    loadItineraryVotes: async (itineraryIds) => {
      try {
        if (itineraryIds.length === 0) {
          set({ itineraryVotes: {} });
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          set({ itineraryVotes: {} });
          return;
        }

        const { data: rows, error } = await supabase
          .from('itinerary_votes')
          .select('id, trip_id, itinerary_id, user_id, choice, created_at')
          .in('itinerary_id', itineraryIds);

        if (error) {
          console.error('Error loading itinerary votes:', error);
          throw error;
        }

        const byItinerary: Record<string, ItineraryVote[]> = {};
        for (const row of rows || []) {
          const r = row as ItineraryVote;
          if (!byItinerary[r.itinerary_id]) byItinerary[r.itinerary_id] = [];
          byItinerary[r.itinerary_id].push(r);
        }

        set((state) => ({ itineraryVotes: { ...state.itineraryVotes, ...byItinerary } }));
      } catch (error) {
        console.error('Error loading itinerary votes:', error);
        throw error;
      }
    },

    createOrUpdateItineraryVote: async (tripId, itineraryId, choice) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: vote, error } = await supabase
          .from('itinerary_votes')
          .upsert(
            {
              trip_id: tripId,
              itinerary_id: itineraryId,
              user_id: user.id,
              choice,
            } as any,
            { onConflict: 'itinerary_id,user_id' },
          )
          .select()
          .single();

        if (error) {
          console.error('Error creating/updating itinerary vote:', error);
          throw error;
        }
        if (!vote) throw new Error('Failed to create/update itinerary vote');

        const vdb = vote as ItineraryVote;
        set((state) => {
          const list = state.itineraryVotes[itineraryId] || [];
          const filtered = list.filter((v) => v.user_id !== user.id);
          return {
            itineraryVotes: {
              ...state.itineraryVotes,
              [itineraryId]: [...filtered, vdb],
            },
          };
        });
      } catch (error) {
        console.error('Error creating/updating itinerary vote:', error);
        throw error;
      }
    },
  };
}
