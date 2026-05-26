import type { Trip } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, CreateTripData, SetState, GetState } from './types';
import { loadTripsFromApi, createTripInApi, updateTripInApi } from './trips-api';

export function createTripsSlice(set: SetState, get: GetState): Partial<AppState> {
  return {
    trips: [],
    currentTrip: null,
    setTrips: (trips) => set({ trips }),
    setCurrentTrip: (trip) => set({ currentTrip: trip }),
    addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
    updateTripInState: (tripId, updates) =>
      set((state) => ({
        trips: state.trips.map((t) => (t.id === tripId ? { ...t, ...updates } : t)),
        currentTrip:
          state.currentTrip?.id === tripId
            ? { ...state.currentTrip, ...updates }
            : state.currentTrip,
      })),

    loadTrips: async () => {
      try {
        const trips = await loadTripsFromApi();
        set({ trips });
      } catch (error) {
        console.error('Error loading trips:', error);
        throw error;
      }
    },

    createTrip: async (tripData: CreateTripData) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const mappedTrip = await createTripInApi(tripData, user.id);
        set((state) => ({ trips: [mappedTrip, ...state.trips] }));
        return mappedTrip;
      } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
      }
    },

    updateTrip: async (tripId, updates) => {
      try {
        const updateData: Record<string, unknown> = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.destination_text !== undefined)
          updateData.destination_text = updates.destination_text;
        if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
        if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.budget_cents !== undefined)
          updateData.budget_cents = updates.budget_cents ?? null;
        if (updates.currency !== undefined) updateData.currency = updates.currency ?? null;
        if (updates.constraints !== undefined) updateData.constraints = updates.constraints ?? null;
        if (updates.active_itinerary_id !== undefined)
          updateData.active_itinerary_id = updates.active_itinerary_id ?? null;
        if (updates.timezone !== undefined) updateData.timezone = updates.timezone;

        const mappedTrip = await updateTripInApi(tripId, updateData);
        get().updateTripInState(tripId, mappedTrip);
      } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
      }
    },

    deleteTrip: async (tripId) => {
      try {
        const { error } = await (supabase.from('trips') as any)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', tripId);

        if (error) {
          console.error('Error deleting trip:', error);
          throw error;
        }

        set((state) => ({
          trips: state.trips.filter((t: Trip) => t.id !== tripId),
          currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        }));
      } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
      }
    },
  };
}
