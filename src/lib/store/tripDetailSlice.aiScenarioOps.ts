import type { Database } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';
import { generateItineraryFromConstraints } from '../ai/openai-itinerary-service';
import type { TripScenario } from './tripDetailSlice.scenarios';
import {
  normalizeTime,
  parseTripConstraints,
  persistGeneratedItinerary,
} from './tripDetailSlice.utils';

export { normalizeTime, parseTripConstraints } from './tripDetailSlice.utils';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];
type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

export function createTripDetailAiScenarioOpsSlice(
  set: SetState,
  get: GetState,
): Pick<
  AppState,
  'generateAiScenario' | 'applyScenarioAsBase' | 'importScenarioActivityToItinerary'
> {
  return {
    generateAiScenario: async (trip, membersCount, locale) => {
      try {
        const constraints = parseTripConstraints(trip.constraints);

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

        await persistGeneratedItinerary(trip, result);
        await get().loadScenarios(trip.id);
      } catch (err) {
        console.error('Error generating AI scenario:', err);
        throw err;
      }
    },

    applyScenarioAsBase: async (tripId: string, scenarioItineraryId: string) => {
      try {
        const scenario = get().scenarios.find((s) => s.id === scenarioItineraryId) as
          | TripScenario
          | undefined;
        if (!scenario) return;

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
