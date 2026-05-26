import type { Activity, Database, Trip, TripConstraints } from '../types/database.types';
import { supabase } from '../supabase';
import { mapRowToActivity } from './activityMapping';
import type { GeneratedItinerary } from '../ai/openai-itinerary-types';
import type { TripScenario } from './tripDetailSlice.scenarios';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];
type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

export interface ScenariosData {
  itineraries: ItineraryRow[];
  dayRows: ItineraryDayRow[];
  activitiesByDayId: Record<string, Activity[]>;
}

export function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function parseTripConstraints(constraints: unknown): TripConstraints | null {
  if (!constraints || typeof constraints !== 'object') return null;
  return constraints as TripConstraints;
}

export async function fetchScenariosData(tripId: string): Promise<ScenariosData | null> {
  const { data: itineraries, error: itError } = await supabase
    .from('itineraries')
    .select('*')
    .eq('trip_id', tripId)
    .is('deleted_at', null);

  if (itError) throw itError;
  if (!itineraries || itineraries.length === 0) return null;

  const ids = itineraries.map((it) => (it as ItineraryRow).id);

  const { data: days, error: daysError } = await supabase
    .from('itinerary_days')
    .select('*')
    .in('itinerary_id', ids);

  if (daysError) throw daysError;

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

    if (actError) throw actError;

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

  return { itineraries: itineraries as ItineraryRow[], dayRows, activitiesByDayId };
}

export async function persistGeneratedItinerary(
  trip: Pick<Trip, 'id' | 'currency'>,
  result: GeneratedItinerary,
): Promise<void> {
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

  const { data: insertedDays, error: daysError } = await (supabase.from('itinerary_days') as any)
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
      cost_cents: typeof a.estimatedCost === 'number' ? Math.round(a.estimatedCost * 100) : null,
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
}

export async function duplicateScenarioAsBaseItinerary(
  tripId: string,
  scenario: TripScenario,
): Promise<string> {
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

  const { data: insertedDays, error: daysError } = await (supabase.from('itinerary_days') as any)
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

  return newItineraryId;
}
