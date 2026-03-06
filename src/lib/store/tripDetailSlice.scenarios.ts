import type { Activity, Database } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';
import { mapRowToActivity } from './activityMapping';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];
type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

export interface TripScenarioDay {
  id: string;
  date: string;
  dayIndex: number;
  activities: Activity[];
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

function mapItineraryToScenario(
  itinerary: ItineraryRow,
  days: ItineraryDayRow[],
  activitiesByDayId: Record<string, Activity[]>,
): TripScenario {
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
        activities: activitiesByDayId[day.id] ?? [],
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

        const dayRows = (days || []) as ItineraryDayRow[];
        const dayIds = dayRows.filter((d) => !d.deleted_at).map((d) => d.id);

        let activitiesByDayId: Record<string, Activity[]> = {};
        if (dayIds.length > 0) {
          const { data: activities, error: actError } = await supabase
            .from('activities')
            .select('*')
            .in('itinerary_day_id', dayIds)
            .is('deleted_at', null)
            .order('start_time', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: true });

          if (actError) {
            console.error('Error loading scenario activities:', actError);
            throw actError;
          }

          activitiesByDayId = ((activities || []) as unknown[]).reduce<Record<string, Activity[]>>(
            (acc, row) => {
              const activity = mapRowToActivity(row as Record<string, unknown>);
              const dayId = activity.itinerary_day_id;
              if (!dayId) return acc;
              if (!acc[dayId]) acc[dayId] = [];
              acc[dayId].push(activity);
              return acc;
            },
            {},
          );
        }

        const mapped = (itineraries as ItineraryRow[]).map((it) =>
          mapItineraryToScenario(it, dayRows, activitiesByDayId),
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
          {},
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
  };
}
