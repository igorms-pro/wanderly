import type { Activity, Vote } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, CreateActivityData, SetState, GetState } from './types';

function mapRowToActivity(row: Record<string, unknown>): Activity {
  const r = row as any;
  return {
    id: r.id,
    trip_id: r.trip_id,
    itinerary_day_id: r.itinerary_day_id ?? undefined,
    place_id: r.place_id ?? undefined,
    place_name: r.place_name ?? undefined,
    title: r.title,
    description: r.description ?? '',
    category: r.category ?? '',
    start_time: r.start_time ?? undefined,
    end_time: r.end_time ?? undefined,
    cost_cents: r.cost_cents ?? undefined,
    cost_min_cents: r.cost_min_cents ?? undefined,
    cost_max_cents: r.cost_max_cents ?? undefined,
    currency: r.currency ?? undefined,
    transport_type: r.transport_type ?? undefined,
    transport_notes: r.transport_notes ?? undefined,
    transport_duration_minutes: r.transport_duration_minutes ?? undefined,
    transport_cost_cents: r.transport_cost_cents ?? undefined,
    organizer_notes: r.organizer_notes ?? undefined,
    packing_checklist: r.packing_checklist ?? null,
    lat: r.lat ?? undefined,
    lon: r.lon ?? undefined,
    status: r.status,
    source: r.source,
    created_at: r.created_at,
  };
}

export function createTripDetailSlice(set: SetState, get: GetState): Partial<AppState> {
  return {
    activities: [],
    setActivities: (activities) => set({ activities }),
    addActivity: (activity) => set((state) => ({ activities: [...state.activities, activity] })),
    updateActivityInState: (activityId, updates) =>
      set((state) => ({
        activities: state.activities.map((a) => (a.id === activityId ? { ...a, ...updates } : a)),
      })),

    loadActivities: async (tripId) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          set({ activities: [] });
          return;
        }

        const { data: activities, error } = await supabase
          .from('activities')
          .select('*')
          .eq('trip_id', tripId)
          .is('deleted_at', null)
          .order('start_time', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading activities:', error);
          throw error;
        }

        const mappedActivities: Activity[] = ((activities || []) as any[]).map(mapRowToActivity);

        set({ activities: mappedActivities });
      } catch (error) {
        console.error('Error loading activities:', error);
        throw error;
      }
    },

    createActivity: async (activityData: CreateActivityData) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: activity, error } = await supabase
          .from('activities')
          .insert({
            trip_id: activityData.trip_id,
            itinerary_day_id: activityData.itinerary_day_id || null,
            title: activityData.title,
            description: activityData.description || null,
            category: activityData.category || null,
            start_time: activityData.start_time || null,
            end_time: activityData.end_time || null,
            cost_cents: activityData.cost_cents ?? null,
            currency: activityData.currency || 'USD',
            lat: activityData.lat ?? null,
            lon: activityData.lon ?? null,
            status: activityData.status || 'proposed',
            source: activityData.source || 'manual',
          } as any)
          .select()
          .single();

        if (error) {
          console.error('Error creating activity:', error);
          throw error;
        }
        if (!activity) throw new Error('Failed to create activity');

        const mappedActivity = mapRowToActivity(activity as Record<string, unknown>);
        set((state) => ({ activities: [...state.activities, mappedActivity] }));
        return mappedActivity;
      } catch (error) {
        console.error('Error creating activity:', error);
        throw error;
      }
    },

    updateActivity: async (activityId, updates) => {
      try {
        const updateData: any = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description || null;
        if (updates.category !== undefined) updateData.category = updates.category || null;
        if (updates.itinerary_day_id !== undefined)
          updateData.itinerary_day_id = updates.itinerary_day_id || null;
        if (updates.start_time !== undefined) updateData.start_time = updates.start_time || null;
        if (updates.end_time !== undefined) updateData.end_time = updates.end_time || null;
        if (updates.cost_cents !== undefined) updateData.cost_cents = updates.cost_cents ?? null;
        if (updates.cost_min_cents !== undefined)
          updateData.cost_min_cents = updates.cost_min_cents ?? null;
        if (updates.cost_max_cents !== undefined)
          updateData.cost_max_cents = updates.cost_max_cents ?? null;
        if (updates.currency !== undefined) updateData.currency = updates.currency ?? null;
        if (updates.transport_type !== undefined)
          updateData.transport_type = updates.transport_type ?? null;
        if (updates.transport_notes !== undefined)
          updateData.transport_notes = updates.transport_notes ?? null;
        if (updates.transport_duration_minutes !== undefined)
          updateData.transport_duration_minutes = updates.transport_duration_minutes ?? null;
        if (updates.transport_cost_cents !== undefined)
          updateData.transport_cost_cents = updates.transport_cost_cents ?? null;
        if (updates.place_name !== undefined) updateData.place_name = updates.place_name ?? null;
        if (updates.organizer_notes !== undefined)
          updateData.organizer_notes = updates.organizer_notes ?? null;
        if (updates.packing_checklist !== undefined)
          updateData.packing_checklist = updates.packing_checklist ?? null;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.lat !== undefined) updateData.lat = updates.lat ?? null;
        if (updates.lon !== undefined) updateData.lon = updates.lon ?? null;

        const { data: activity, error } = await (supabase.from('activities') as any)
          .update(updateData)
          .eq('id', activityId)
          .select()
          .single();

        if (error) {
          console.error('Error updating activity:', error);
          throw error;
        }
        if (!activity) throw new Error('Activity not found');

        get().updateActivityInState(
          activityId,
          mapRowToActivity(activity as Record<string, unknown>),
        );
      } catch (error) {
        console.error('Error updating activity:', error);
        throw error;
      }
    },

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

    messages: [],
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  };
}
