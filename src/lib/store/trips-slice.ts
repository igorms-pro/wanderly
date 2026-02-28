import { Trip } from '../mock-supabase';
import { supabase } from '../supabase';
import type { AppState, CreateTripData, SetState, GetState } from './types';

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          set({ trips: [] });
          return;
        }

        const { data: memberships, error: membershipsError } = await supabase
          .from('trip_members')
          .select('trip_id')
          .eq('user_id', user.id)
          .is('removed_at', null);

        if (membershipsError) {
          console.error('Error loading trip memberships:', membershipsError);
          throw membershipsError;
        }

        if (!memberships || memberships.length === 0) {
          set({ trips: [] });
          return;
        }

        const tripIds = (memberships as { trip_id: string }[]).map((m) => m.trip_id);

        const { data: trips, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .in('id', tripIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (tripsError) {
          console.error('Error loading trips:', tripsError);
          throw tripsError;
        }

        const mappedTrips: Trip[] = ((trips || []) as any[]).map((trip: any) => ({
          id: trip.id,
          owner_id: trip.owner_id,
          title: trip.title,
          destination_text: trip.destination_text,
          start_date: trip.start_date,
          end_date: trip.end_date,
          status: trip.status,
          budget_cents: trip.budget_cents ?? undefined,
          currency: trip.currency ?? undefined,
          constraints: trip.constraints ?? undefined,
          created_at: trip.created_at,
          updated_at: trip.updated_at,
        }));

        set({ trips: mappedTrips });
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

        const { data: trip, error } = await supabase
          .from('trips')
          .insert({
            owner_id: user.id,
            title: tripData.title,
            destination_text: tripData.destination_text,
            start_date: tripData.start_date,
            end_date: tripData.end_date,
            status: tripData.status || 'planned',
            budget_cents: tripData.budget_cents ?? null,
            currency: tripData.currency ?? null,
            constraints: tripData.constraints ?? null,
          } as any)
          .select()
          .single();

        if (error) {
          console.error('Error creating trip:', error);
          throw error;
        }
        if (!trip) throw new Error('Failed to create trip');

        const tripFromDb = trip as any;
        const mappedTrip: Trip = {
          id: tripFromDb.id,
          owner_id: tripFromDb.owner_id,
          title: tripFromDb.title,
          destination_text: tripFromDb.destination_text,
          start_date: tripFromDb.start_date,
          end_date: tripFromDb.end_date,
          status: tripFromDb.status,
          budget_cents: tripFromDb.budget_cents ?? undefined,
          currency: tripFromDb.currency ?? undefined,
          constraints: tripFromDb.constraints ?? undefined,
          created_at: tripFromDb.created_at,
          updated_at: tripFromDb.updated_at,
        };

        set((state) => ({ trips: [mappedTrip, ...state.trips] }));
        return mappedTrip;
      } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
      }
    },

    updateTrip: async (tripId, updates) => {
      try {
        const updateData: any = {};
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

        const { data: trip, error } = await (supabase.from('trips') as any)
          .update(updateData)
          .eq('id', tripId)
          .select()
          .single();

        if (error) {
          console.error('Error updating trip:', error);
          throw error;
        }
        if (!trip) throw new Error('Trip not found');

        const tripData = trip as any;
        const mappedTrip: Trip = {
          id: tripData.id,
          owner_id: tripData.owner_id,
          title: tripData.title,
          destination_text: tripData.destination_text,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          status: tripData.status,
          budget_cents: tripData.budget_cents ?? undefined,
          currency: tripData.currency ?? undefined,
          constraints: tripData.constraints ?? undefined,
          created_at: tripData.created_at,
          updated_at: tripData.updated_at,
        };

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
          trips: state.trips.filter((t) => t.id !== tripId),
          currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        }));
      } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
      }
    },
  };
}
