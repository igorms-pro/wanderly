import type { Activity, Database } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, CreateActivityData, SetState, GetState } from './types';
import { mapRowToActivity } from './activityMapping';

export function createTripDetailActivitiesSlice(set: SetState, get: GetState): Partial<AppState> {
  type ActivitiesUpdate = Database['public']['Tables']['activities']['Update'];
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
          .order('order_index', { ascending: true, nullsFirst: false })
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
            cost_cents: activityData.cost_cents ?? activityData.cost_min_cents ?? null,
            cost_min_cents: activityData.cost_min_cents ?? null,
            cost_max_cents: activityData.cost_max_cents ?? null,
            currency: activityData.currency || 'USD',
            lat: activityData.lat ?? null,
            lon: activityData.lon ?? null,
            place_name: activityData.place_name ?? null,
            transport_type: activityData.transport_type ?? null,
            transport_notes: activityData.transport_notes ?? null,
            transport_duration_minutes: activityData.transport_duration_minutes ?? null,
            status: activityData.status || 'proposed',
            source: activityData.source || 'manual',
            organizer_notes: activityData.organizer_notes ?? null,
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
        if (updates.order_index !== undefined) updateData.order_index = updates.order_index ?? null;

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

    deleteActivity: async (activityId) => {
      try {
        const { error } = await (supabase.from('activities') as any)
          .update({ deleted_at: new Date().toISOString() } as ActivitiesUpdate)
          .eq('id', activityId);

        if (error) {
          console.error('Error deleting activity:', error);
          throw error;
        }

        set((state) => ({
          activities: state.activities.filter((a) => a.id !== activityId),
        }));
      } catch (error) {
        console.error('Error deleting activity:', error);
        throw error;
      }
    },
  };
}
