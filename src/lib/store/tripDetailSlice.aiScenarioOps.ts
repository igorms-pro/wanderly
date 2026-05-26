import { AiScenarioGenerationError } from '../ai/aiScenarioGenerationError';
import { maxAiScenariosForTier, type AiTier } from '../ai/aiScenarioLimits';
import { generateItineraryFromConstraints } from '../ai/openai-itinerary-service';
import { captureFeatureError } from '../errorHandling';
import { supabase } from '../supabase';
import type { AppState, GetState, SetState } from './types';
import type { TripScenario } from './tripDetailSlice.scenarios';
import {
  duplicateScenarioAsBaseItinerary,
  parseTripConstraints,
  persistGeneratedItinerary,
} from './tripDetailSlice.utils';

export { normalizeTime, parseTripConstraints } from './tripDetailSlice.utils';

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

        await persistGeneratedItinerary(trip, result);
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

        const newItineraryId = await duplicateScenarioAsBaseItinerary(tripId, scenario);

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
