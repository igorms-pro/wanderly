import type { Activity, Database, Trip } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';
import { generateItineraryFromConstraints } from '../ai/openai-itinerary-service';

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
  | 'generateAiScenario'
  | 'ensureActiveItinerary'
  | 'setActiveItinerary'
  | 'applyScenarioAsBase'
  | 'importScenarioActivityToItinerary'
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

          activitiesByDayId =
            (activities as any[] | null | undefined)?.reduce<Record<string, Activity[]>>(
              (acc, row) => {
                const r = row as any;
                const dayId = r.itinerary_day_id as string | null | undefined;
                if (!dayId) return acc;
                if (!acc[dayId]) acc[dayId] = [];
                acc[dayId].push(row as Activity);
                return acc;
              },
              {},
            ) ?? {};
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

    generateAiScenario: async (trip, membersCount, locale) => {
      try {
        const constraints =
          (trip.constraints as unknown as {
            pace?: any;
            budget_per_person_cents?: number;
            preferences?: string;
          } | null) ?? null;

        const result = await generateItineraryFromConstraints({
          request: {
            destination: trip.destination_text,
            startDate: trip.start_date,
            endDate: trip.end_date,
            groupSize: Math.max(1, membersCount),
            pace: constraints?.pace,
            budget:
              typeof constraints?.budget_per_person_cents === 'number'
                ? Math.round(constraints.budget_per_person_cents / 100)
                : undefined,
            currency: trip.currency ?? undefined,
            interests: constraints?.preferences ? [constraints.preferences] : undefined,
          },
          locale,
        });

        const { data: itinerary, error: itError } = await (supabase.from('itineraries') as any)
          .insert({
            trip_id: trip.id,
            title: result.title,
            generated_by_ai: true,
          })
          .select()
          .single();

        if (itError) throw itError;
        if (!itinerary) throw new Error('Failed to create AI scenario itinerary');
        const itineraryId = (itinerary as ItineraryRow).id;

        const dayPayload = result.days.map((d) => ({
          itinerary_id: itineraryId,
          date: d.date,
          day_index: d.dayIndex,
        }));

        const { data: insertedDays, error: daysError } = await (
          supabase.from('itinerary_days') as any
        )
          .insert(dayPayload)
          .select();
        if (daysError) throw daysError;

        const dayIdByDate: Record<string, string> = {};
        for (const row of (insertedDays || []) as ItineraryDayRow[]) {
          dayIdByDate[row.date] = row.id;
        }

        const toInsertActivities = result.days.flatMap((d) => {
          const dayId = dayIdByDate[d.date];
          if (!dayId) return [];
          return d.activities.map((a) => {
            const normalizeTime = (v: string) => (v.length === 5 ? `${v}:00` : v);
            return {
              trip_id: trip.id,
              itinerary_day_id: dayId,
              title: a.title,
              description: a.description ?? null,
              category: a.category ?? null,
              start_time: a.startTime ? normalizeTime(a.startTime) : null,
              end_time: a.endTime ? normalizeTime(a.endTime) : null,
              cost_cents:
                typeof a.estimatedCost === 'number' ? Math.round(a.estimatedCost * 100) : null,
              currency: trip.currency ?? null,
              place_name: a.location?.address ?? null,
              lat: a.location?.lat ?? null,
              lon: a.location?.lon ?? null,
              status: 'proposed',
              source: 'ai',
            };
          });
        });

        if (toInsertActivities.length > 0) {
          const { error: actError } = await (supabase.from('activities') as any).insert(
            toInsertActivities,
          );
          if (actError) throw actError;
        }

        await get().loadScenarios(trip.id);
      } catch (err) {
        console.error('Error generating AI scenario:', err);
        throw err;
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

    applyScenarioAsBase: async (tripId: string, scenarioItineraryId: string) => {
      try {
        const scenario = get().scenarios.find((s) => s.id === scenarioItineraryId);
        if (!scenario) return;

        // Create a new manual itinerary as a stable copy of the chosen scenario
        const { data: newItinerary, error: itError } = await (supabase.from('itineraries') as any)
          .insert({
            trip_id: tripId,
            title: scenario.title || 'Itinerary (base)',
            generated_by_ai: false,
          })
          .select()
          .single();
        if (itError) throw itError;
        if (!newItinerary) throw new Error('Failed to create base itinerary');

        const newItineraryId = (newItinerary as ItineraryRow).id;

        const dayPayload = scenario.days.map((d) => ({
          itinerary_id: newItineraryId,
          date: d.date,
          day_index: d.dayIndex,
        }));

        const { data: insertedDays, error: daysError } = await (
          supabase.from('itinerary_days') as any
        )
          .insert(dayPayload)
          .select();
        if (daysError) throw daysError;

        const dayIdByDate: Record<string, string> = {};
        for (const row of (insertedDays || []) as ItineraryDayRow[]) {
          dayIdByDate[row.date] = row.id;
        }

        const toInsertActivities = scenario.days.flatMap((d) => {
          const targetDayId = dayIdByDate[d.date];
          if (!targetDayId) return [];
          return d.activities.map((a) => ({
            trip_id: tripId,
            itinerary_day_id: targetDayId,
            title: a.title,
            description: a.description ?? null,
            category: a.category ?? null,
            start_time: a.start_time ?? null,
            end_time: a.end_time ?? null,
            cost_cents: a.cost_cents ?? null,
            cost_min_cents: a.cost_min_cents ?? null,
            cost_max_cents: a.cost_max_cents ?? null,
            currency: a.currency ?? null,
            place_id: a.place_id ?? null,
            place_name: a.place_name ?? null,
            lat: a.lat ?? null,
            lon: a.lon ?? null,
            transport_type: a.transport_type ?? null,
            transport_notes: a.transport_notes ?? null,
            transport_duration_minutes: a.transport_duration_minutes ?? null,
            transport_cost_cents: a.transport_cost_cents ?? null,
            organizer_notes: a.organizer_notes ?? null,
            packing_checklist: a.packing_checklist ?? null,
            status: a.status ?? 'proposed',
            source: a.source ?? (scenario.isAiGenerated ? 'ai' : 'import'),
          }));
        });

        if (toInsertActivities.length > 0) {
          const { error: actError } = await (supabase.from('activities') as any).insert(
            toInsertActivities,
          );
          if (actError) throw actError;
        }

        await get().setActiveItinerary(tripId, newItineraryId);
        await get().loadActiveItineraryDays(newItineraryId);
        await get().loadActivities(tripId);
      } catch (err) {
        console.error('Error using scenario as base:', err);
        throw err;
      }
    },

    importScenarioActivityToItinerary: async (tripId, date, activity) => {
      try {
        const trip = get().currentTrip;
        if (!trip || trip.id !== tripId) return;

        const activeId = await get().ensureActiveItinerary(trip);
        if (!get().activeItineraryDays.some((d) => d.itinerary_id === activeId)) {
          await get().loadActiveItineraryDays(activeId);
        }

        const targetDayId = get().getActiveItineraryDayIdByDate(date);
        if (!targetDayId) return;

        const { error } = await (supabase.from('activities') as any).insert({
          trip_id: tripId,
          itinerary_day_id: targetDayId,
          title: activity.title,
          description: activity.description ?? null,
          category: activity.category ?? null,
          start_time: activity.start_time ?? null,
          end_time: activity.end_time ?? null,
          cost_cents: activity.cost_cents ?? null,
          cost_min_cents: activity.cost_min_cents ?? null,
          cost_max_cents: activity.cost_max_cents ?? null,
          currency: activity.currency ?? null,
          place_id: activity.place_id ?? null,
          place_name: activity.place_name ?? null,
          lat: activity.lat ?? null,
          lon: activity.lon ?? null,
          transport_type: activity.transport_type ?? null,
          transport_notes: activity.transport_notes ?? null,
          transport_duration_minutes: activity.transport_duration_minutes ?? null,
          transport_cost_cents: activity.transport_cost_cents ?? null,
          organizer_notes: activity.organizer_notes ?? null,
          packing_checklist: activity.packing_checklist ?? null,
          status: activity.status ?? 'proposed',
          source: activity.source ?? 'import',
        });

        if (error) throw error;
        await get().loadActivities(tripId);
      } catch (err) {
        console.error('Error importing activity to itinerary:', err);
        throw err;
      }
    },
  };
}
