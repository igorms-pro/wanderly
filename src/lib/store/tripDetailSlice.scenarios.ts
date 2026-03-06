import type { Database, Trip } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];
type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

function getDateStringsInclusive(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  // Guard against invalid dates
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return dates;

  let current = start;
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return dates;
}

export interface TripScenarioDay {
  id: string;
  date: string;
  dayIndex: number;
}

export interface TripScenario {
  id: string;
  tripId: string;
  title: string | null;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  days: TripScenarioDay[];
}

function mapItineraryToScenario(itinerary: ItineraryRow, days: ItineraryDayRow[]): TripScenario {
  return {
    id: itinerary.id,
    tripId: itinerary.trip_id,
    title: itinerary.title,
    isAiGenerated: itinerary.generated_by_ai,
    createdAt: itinerary.created_at,
    updatedAt: itinerary.updated_at,
    days: days
      .filter((day) => day.itinerary_id === itinerary.id && !day.deleted_at)
      .sort((a, b) => a.day_index - b.day_index)
      .map((day) => ({
        id: day.id,
        date: day.date,
        dayIndex: day.day_index,
      })),
  };
}

export function createTripDetailScenariosSlice(
  set: SetState,
  get: GetState,
): Pick<
  AppState,
  | 'scenarios'
  | 'setScenarios'
  | 'addScenario'
  | 'removeScenario'
  | 'loadScenarios'
  | 'createScenario'
  | 'deleteScenario'
  | 'ensureActiveItinerary'
  | 'setActiveItinerary'
> {
  return {
    scenarios: [],

    setScenarios: (scenarios) => set({ scenarios }),

    addScenario: (scenario) =>
      set((state) => ({
        scenarios: [...state.scenarios, scenario],
      })),

    removeScenario: (scenarioId) =>
      set((state) => ({
        scenarios: state.scenarios.filter((s) => s.id !== scenarioId),
      })),

    loadScenarios: async (tripId) => {
      try {
        const { data: itineraries, error: itError } = await supabase
          .from('itineraries')
          .select('*')
          .eq('trip_id', tripId)
          .is('deleted_at', null);

        if (itError) {
          console.error('Error loading itineraries:', itError);
          throw itError;
        }

        if (!itineraries || itineraries.length === 0) {
          set({ scenarios: [] });
          return;
        }

        const ids = itineraries.map((it) => (it as ItineraryRow).id);

        const { data: days, error: daysError } = await supabase
          .from('itinerary_days')
          .select('*')
          .in('itinerary_id', ids);

        if (daysError) {
          console.error('Error loading itinerary days:', daysError);
          throw daysError;
        }

        const mapped = (itineraries as ItineraryRow[]).map((it) =>
          mapItineraryToScenario(it, (days || []) as ItineraryDayRow[]),
        );

        set({ scenarios: mapped });
      } catch (error) {
        console.error('Error loading scenarios:', error);
        throw error;
      }
    },

    createScenario: async (tripId, payload) => {
      try {
        const { title, days } = payload;

        const { data: itinerary, error: itError } = await (supabase.from('itineraries') as any)
          .insert({
            trip_id: tripId,
            title: title || null,
            generated_by_ai: false,
          })
          .select()
          .single();

        if (itError) {
          console.error('Error creating itinerary:', itError);
          throw itError;
        }

        if (!itinerary) {
          throw new Error('Failed to create itinerary');
        }

        const itineraryId = (itinerary as ItineraryRow).id;

        if (days.length > 0) {
          const toInsert = days.map(
            (day, index): ItineraryDayRow => ({
              id: crypto.randomUUID(),
              itinerary_id: itineraryId,
              date: day.date,
              day_index: day.dayIndex ?? index + 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
            }),
          );

          const { error: daysError } = await (supabase.from('itinerary_days') as any).insert(
            toInsert,
          );

          if (daysError) {
            console.error('Error creating itinerary days:', daysError);
            throw daysError;
          }
        }

        const { data: allDays, error: loadDaysError } = await supabase
          .from('itinerary_days')
          .select('*')
          .eq('itinerary_id', itineraryId);

        if (loadDaysError) {
          console.error('Error loading itinerary days after insert:', loadDaysError);
          throw loadDaysError;
        }

        const scenario = mapItineraryToScenario(
          itinerary as ItineraryRow,
          (allDays || []) as ItineraryDayRow[],
        );

        get().addScenario(scenario);

        return scenario;
      } catch (error) {
        console.error('Error creating scenario:', error);
        throw error;
      }
    },

    deleteScenario: async (scenarioId) => {
      try {
        const { scenarios } = get();
        const scenario = scenarios.find((s) => s.id === scenarioId);
        if (!scenario) return;

        const { error } = await (supabase.from('itineraries') as any)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', scenarioId);

        if (error) {
          console.error('Error deleting scenario:', error);
          throw error;
        }

        get().removeScenario(scenarioId);
      } catch (error) {
        console.error('Error deleting scenario:', error);
        throw error;
      }
    },

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

        if (itError) {
          console.error('Error creating active itinerary:', itError);
          throw itError;
        }
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
          if (daysError) {
            console.error('Error creating active itinerary days:', daysError);
            throw daysError;
          }
        }

        const { data: updatedTrip, error: tripUpdateError } = await (supabase.from('trips') as any)
          .update({ active_itinerary_id: itineraryId })
          .eq('id', trip.id)
          .select()
          .single();

        if (tripUpdateError) {
          console.error('Error setting active itinerary on trip:', tripUpdateError);
          throw tripUpdateError;
        }

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

        if (error) {
          console.error('Error updating trip active itinerary:', error);
          throw error;
        }

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
