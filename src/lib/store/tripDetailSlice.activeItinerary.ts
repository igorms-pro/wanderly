import type { Database, Trip } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];

function getDateStringsInclusive(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return dates;

  let current = start;
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
}

export function createTripDetailActiveItinerarySlice(
  set: SetState,
  get: GetState,
): Pick<AppState, 'ensureActiveItinerary' | 'setActiveItinerary'> {
  return {
    ensureActiveItinerary: async (trip: Trip) => {
      if (trip.active_itinerary_id) return trip.active_itinerary_id;

      try {
        const { data: itinerary, error: itError } = await (supabase.from('itineraries') as any)
          .insert({
            trip_id: trip.id,
            title: 'Active itinerary',
            generated_by_ai: false,
          })
          .select()
          .single();

        if (itError) throw itError;
        if (!itinerary) throw new Error('Failed to create active itinerary');

        const itineraryId = (itinerary as ItineraryRow).id;

        const dateStrings = getDateStringsInclusive(trip.start_date, trip.end_date);
        if (dateStrings.length > 0) {
          const daysToInsert = dateStrings.map((date, idx) => ({
            itinerary_id: itineraryId,
            date,
            day_index: idx + 1,
          }));

          const { error: daysError } = await (supabase.from('itinerary_days') as any).insert(
            daysToInsert,
          );
          if (daysError) throw daysError;
        }

        const { data: updatedTrip, error: tripUpdateError } = await (supabase.from('trips') as any)
          .update({ active_itinerary_id: itineraryId })
          .eq('id', trip.id)
          .select()
          .single();

        if (tripUpdateError) throw tripUpdateError;

        const activeId =
          (updatedTrip as { active_itinerary_id?: string | null }).active_itinerary_id ??
          itineraryId;

        get().updateTripInState(trip.id, { active_itinerary_id: activeId });
        return activeId;
      } catch (error) {
        console.error('Error ensuring active itinerary:', error);
        throw error;
      }
    },

    setActiveItinerary: async (tripId: string, itineraryId: string) => {
      try {
        const { data: updatedTrip, error } = await (supabase.from('trips') as any)
          .update({ active_itinerary_id: itineraryId })
          .eq('id', tripId)
          .select()
          .single();

        if (error) throw error;

        const activeId =
          (updatedTrip as { active_itinerary_id?: string | null }).active_itinerary_id ??
          itineraryId;

        get().updateTripInState(tripId, { active_itinerary_id: activeId });
      } catch (err) {
        console.error('Error setting active itinerary:', err);
        throw err;
      }
    },
  };
}
