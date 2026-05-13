import { AiScenarioGenerationError } from '../ai/aiScenarioGenerationError';
import { maxAiScenariosForTier, type AiTier } from '../ai/aiScenarioLimits';
import { generateItineraryFromConstraints } from '../ai/openai-itinerary-service';
import { captureFeatureError } from '../errorHandling';
import { supabase } from '../supabase';
import type { Database, Trip, TripConstraints } from '../types/database.types';
import type { AppState, GetState, SetState } from './types';
import type { TripScenario } from './tripDetailSlice.scenarios';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];
type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

export function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function parseTripConstraints(constraints: unknown): TripConstraints | null {
  if (!constraints || typeof constraints !== 'object') return null;
  return constraints as TripConstraints;
}

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new AiScenarioGenerationError('unknown');

        const { data: profileRow } = await supabase
          .from('profiles')
          .select('ai_tier')
          .eq('id', user.id)
          .maybeSingle();

        const tier: AiTier =
          (profileRow as { ai_tier?: string } | null)?.ai_tier === 'premium' ? 'premium' : 'free';
        const maxScenarios = maxAiScenariosForTier(tier);

        const { count, error: quotaErr } = await supabase
          .from('itineraries')
          .select('id', { head: true, count: 'exact' })
          .eq('trip_id', trip.id)
          .eq('generated_by_ai', true)
          .is('deleted_at', null);

        if (quotaErr) {
          captureFeatureError(quotaErr, 'ai_scenario_quota_count', { trip_id: trip.id });
          throw new AiScenarioGenerationError('unknown');
        }
        if ((count ?? 0) >= maxScenarios) {
          throw new AiScenarioGenerationError('quota_exceeded');
        }

        const constraints = parseTripConstraints(trip.constraints);

        const interests =
          constraints?.preferences && constraints.preferences.trim().length > 0
            ? [constraints.preferences.trim()]
            : undefined;

        const result = await generateItineraryFromConstraints({
          tripId: trip.id,
          membersCount,
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
            interests,
            has_children: constraints?.has_children,
            must_dos: constraints?.must_dos?.length ? constraints.must_dos : undefined,
            no_gos: constraints?.no_gos?.length ? constraints.no_gos : undefined,
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
          return d.activities.map((a) => ({
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
          }));
        });

        if (toInsertActivities.length > 0) {
          const { error: actError } = await (supabase.from('activities') as any).insert(
            toInsertActivities,
          );
          if (actError) throw actError;
        }

        await get().loadScenarios(trip.id);
      } catch (err) {
        const skipSentry =
          err instanceof AiScenarioGenerationError && err.code === 'quota_exceeded';
        if (!skipSentry) {
          captureFeatureError(err, 'ai_scenario_generate', {
            trip_id: trip.id,
          });
        }
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
        captureFeatureError(err, 'ai_scenario_apply_base', { trip_id: tripId });
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
        captureFeatureError(err, 'ai_scenario_import_activity', { trip_id: tripId, date });
        throw err;
      }
    },
  };
}
