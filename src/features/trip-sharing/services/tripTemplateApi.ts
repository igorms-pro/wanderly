import { supabase } from '@/lib/supabase';
import { fetchScenariosData } from '@/lib/store/tripDetailSlice.utils';
import type { Trip } from '@/lib/types/database.types';
import { buildTemplateSnapshot } from '../lib/buildTemplateSnapshot';
import type { TripTemplate, TripTemplateData } from '../types';
import { createTripFromTemplateInApi } from './tripCloneApi';

const TEMPLATE_COLUMNS =
  'id, owner_id, source_trip_id, title, description, destination_text, template_data, is_public, created_at, updated_at';

function mapTemplate(row: Record<string, unknown>): TripTemplate {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    source_trip_id: (row.source_trip_id as string | null) ?? null,
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    destination_text: String(row.destination_text),
    template_data: row.template_data as TripTemplateData,
    is_public: Boolean(row.is_public),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function fetchMyTripTemplates(userId: string): Promise<TripTemplate[]> {
  const { data, error } = await supabase
    .from('trip_templates')
    .select(TEMPLATE_COLUMNS)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapTemplate);
}

export async function fetchPublicTripTemplates(): Promise<TripTemplate[]> {
  const { data, error } = await supabase
    .from('trip_templates')
    .select(TEMPLATE_COLUMNS)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapTemplate);
}

export async function saveTripAsTemplate(
  userId: string,
  trip: Trip,
  input: { title: string; description?: string; isPublic?: boolean },
): Promise<TripTemplate> {
  let templateData: TripTemplateData = {
    duration_days: 1,
    days: [],
    constraints: (trip.constraints as TripTemplateData['constraints']) ?? null,
    budget_cents: trip.budget_cents ?? null,
    currency: trip.currency ?? null,
    timezone: trip.timezone ?? 'UTC',
  };

  if (trip.active_itinerary_id) {
    const { data: days, error: daysError } = await supabase
      .from('itinerary_days')
      .select('id, date, day_index')
      .eq('itinerary_id', trip.active_itinerary_id)
      .is('deleted_at', null);

    if (daysError) throw daysError;

    const dayRows = (days ?? []) as { id: string; date: string; day_index: number | null }[];
    const dayIds = dayRows.map((d) => d.id);
    let activitiesByDayId: Record<string, import('@/lib/types/database.types').Activity[]> = {};

    if (dayIds.length > 0) {
      const { data: activities, error: actError } = await supabase
        .from('activities')
        .select('*')
        .in('itinerary_day_id', dayIds)
        .is('deleted_at', null);

      if (actError) throw actError;

      activitiesByDayId = (activities ?? []).reduce<
        Record<string, import('@/lib/types/database.types').Activity[]>
      >((acc, row) => {
        const activity = row as import('@/lib/types/database.types').Activity;
        const dayId = activity.itinerary_day_id;
        if (!dayId) return acc;
        if (!acc[dayId]) acc[dayId] = [];
        acc[dayId].push(activity);
        return acc;
      }, {});
    }

    templateData = buildTemplateSnapshot(trip, dayRows, activitiesByDayId);
  } else {
    const scenarios = await fetchScenariosData(trip.id);
    if (scenarios) {
      const firstItinerary = scenarios.itineraries[0];
      const dayRows = scenarios.dayRows
        .filter((d) => d.itinerary_id === firstItinerary?.id && !d.deleted_at)
        .map((d) => ({ id: d.id, date: d.date, day_index: d.day_index }));
      templateData = buildTemplateSnapshot(trip, dayRows, scenarios.activitiesByDayId);
    }
  }

  const { data, error } = await supabase
    .from('trip_templates')
    .insert({
      owner_id: userId,
      source_trip_id: trip.id,
      title: input.title,
      description: input.description ?? null,
      destination_text: trip.destination_text,
      template_data: templateData,
      is_public: input.isPublic ?? false,
    } as never)
    .select(TEMPLATE_COLUMNS)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to save template');
  return mapTemplate(data as Record<string, unknown>);
}

export async function createTripFromTemplate(
  userId: string,
  template: TripTemplate,
  input: { title: string; start_date: string; end_date: string },
): Promise<Trip> {
  return createTripFromTemplateInApi(userId, template, input);
}

export async function deleteTripTemplate(templateId: string): Promise<void> {
  const { error } = await supabase.from('trip_templates').delete().eq('id', templateId);
  if (error) throw error;
}
