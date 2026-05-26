import { supabase } from '@/lib/supabase';
import type { Trip } from '@/lib/types/database.types';
import { createTripInApi, mapTripFromDb } from '@/lib/store/trips-api';
import { fetchScenariosData } from '@/lib/store/tripDetailSlice.utils';
import type { TemplateDaySnapshot, TripTemplateData } from '../types';
import { addDaysToIsoDate, buildDateShiftMap } from '../lib/shiftTripDates';

type ActivityInsert = Record<string, unknown>;

async function loadItineraryCloneSource(tripId: string, itineraryId: string | null | undefined) {
  if (itineraryId) {
    const { data: days, error } = await supabase
      .from('itinerary_days')
      .select('id, date, day_index')
      .eq('itinerary_id', itineraryId)
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (error) throw error;

    const dayRows = (days ?? []) as { id: string; date: string; day_index: number | null }[];
    if (dayRows.length === 0) return null;

    const dayIds = dayRows.map((d) => d.id);
    const { data: activities, error: actError } = await supabase
      .from('activities')
      .select('*')
      .in('itinerary_day_id', dayIds)
      .is('deleted_at', null);

    if (actError) throw actError;

    const activitiesByDayId = (activities ?? []).reduce<Record<string, ActivityInsert[]>>(
      (acc, row) => {
        const activity = row as Record<string, unknown>;
        const dayId = activity.itinerary_day_id as string;
        if (!acc[dayId]) acc[dayId] = [];
        acc[dayId].push(activity);
        return acc;
      },
      {},
    );

    return { dayRows, activitiesByDayId };
  }

  const scenarios = await fetchScenariosData(tripId);
  if (!scenarios || scenarios.dayRows.length === 0) return null;

  const firstItinerary = scenarios.itineraries[0];
  const dayRows = scenarios.dayRows
    .filter((d) => d.itinerary_id === firstItinerary.id && !d.deleted_at)
    .map((d) => ({ id: d.id, date: d.date, day_index: d.day_index }));

  return {
    dayRows,
    activitiesByDayId: scenarios.activitiesByDayId as Record<string, ActivityInsert[]>,
  };
}

function mapActivityForClone(
  tripId: string,
  targetDayId: string,
  activity: ActivityInsert,
  currency: string | null,
): ActivityInsert {
  return {
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
    currency: activity.currency ?? currency,
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
    status: 'proposed',
    source: activity.source ?? 'import',
  };
}

async function persistClonedItinerary(
  tripId: string,
  sourceStartDate: string,
  targetStartDate: string,
  targetEndDate: string,
  currency: string | null,
  dayRows: { id: string; date: string; day_index: number | null }[],
  activitiesByDayId: Record<string, ActivityInsert[]>,
  templateDays?: TemplateDaySnapshot[],
): Promise<void> {
  const { data: itinerary, error: itError } = await (supabase.from('itineraries') as any)
    .insert({ trip_id: tripId, title: 'Itinerary', generated_by_ai: false })
    .select()
    .single();

  if (itError) throw itError;
  if (!itinerary) throw new Error('Failed to create itinerary');

  const itineraryId = (itinerary as { id: string }).id;
  let dayPayload: { itinerary_id: string; date: string; day_index: number }[];

  if (templateDays && templateDays.length > 0) {
    dayPayload = templateDays.map((day, index) => ({
      itinerary_id: itineraryId,
      date: addDaysToIsoDate(targetStartDate, day.day_offset),
      day_index: index,
    }));
  } else {
    const dateMap = buildDateShiftMap(
      sourceStartDate,
      targetStartDate,
      dayRows.map((d) => d.date),
    );
    dayPayload = dayRows.map((day, index) => ({
      itinerary_id: itineraryId,
      date: dateMap[day.date] ?? day.date,
      day_index: day.day_index ?? index,
    }));
  }

  const filteredDays = dayPayload.filter(
    (d) => d.date >= targetStartDate && d.date <= targetEndDate,
  );
  if (filteredDays.length === 0) {
    await (supabase.from('trips') as any)
      .update({ active_itinerary_id: itineraryId })
      .eq('id', tripId);
    return;
  }

  const { data: insertedDays, error: daysError } = await (supabase.from('itinerary_days') as any)
    .insert(filteredDays)
    .select();

  if (daysError) throw daysError;

  const targetDayByKey = new Map<string, string>();
  if (templateDays) {
    templateDays.forEach((day, index) => {
      const inserted = (insertedDays ?? [])[index] as { id: string; date: string } | undefined;
      if (inserted) targetDayByKey.set(String(day.day_offset), inserted.id);
    });
  } else {
    const dateMap = buildDateShiftMap(
      sourceStartDate,
      targetStartDate,
      dayRows.map((d) => d.date),
    );
    for (const row of (insertedDays ?? []) as { id: string; date: string }[]) {
      const sourceDate = Object.entries(dateMap).find(([, target]) => target === row.date)?.[0];
      const sourceDay = dayRows.find((d) => d.date === sourceDate);
      if (sourceDay) targetDayByKey.set(sourceDay.id, row.id);
    }
  }

  const toInsert: ActivityInsert[] = [];

  if (templateDays) {
    for (const day of templateDays) {
      const targetDayId = targetDayByKey.get(String(day.day_offset));
      if (!targetDayId) continue;
      for (const activity of day.activities) {
        toInsert.push(mapActivityForClone(tripId, targetDayId, activity, currency));
      }
    }
  } else {
    for (const sourceDay of dayRows) {
      const targetDayId = targetDayByKey.get(sourceDay.id);
      if (!targetDayId) continue;
      for (const activity of activitiesByDayId[sourceDay.id] ?? []) {
        toInsert.push(mapActivityForClone(tripId, targetDayId, activity, currency));
      }
    }
  }

  if (toInsert.length > 0) {
    const { error: actError } = await (supabase.from('activities') as any).insert(toInsert);
    if (actError) throw actError;
  }

  await (supabase.from('trips') as any)
    .update({ active_itinerary_id: itineraryId })
    .eq('id', tripId);
}

export async function duplicateTripInApi(
  userId: string,
  sourceTripId: string,
  input: { title: string; start_date: string; end_date: string },
): Promise<Trip> {
  const { data: source, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', sourceTripId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  if (!source) throw new Error('Source trip not found');

  const raw = source as Record<string, unknown>;
  const trip = await createTripInApi(
    {
      title: input.title,
      destination_text: String(raw.destination_text),
      start_date: input.start_date,
      end_date: input.end_date,
      status: 'planned',
      budget_cents: (raw.budget_cents as number | null) ?? undefined,
      currency: (raw.currency as string | null) ?? undefined,
      constraints: (raw.constraints as Record<string, unknown> | null) ?? undefined,
    },
    userId,
  );

  if (raw.timezone) {
    await (supabase.from('trips') as any).update({ timezone: raw.timezone }).eq('id', trip.id);
  }

  const cloneSource = await loadItineraryCloneSource(
    sourceTripId,
    (raw.active_itinerary_id as string | null) ?? null,
  );

  if (cloneSource) {
    await persistClonedItinerary(
      trip.id,
      String(raw.start_date),
      input.start_date,
      input.end_date,
      (raw.currency as string | null) ?? null,
      cloneSource.dayRows,
      cloneSource.activitiesByDayId,
    );
  }

  const { data: refreshed, error: refreshError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', trip.id)
    .single();

  if (refreshError) throw refreshError;
  return mapTripFromDb(refreshed);
}

export async function createTripFromTemplateInApi(
  userId: string,
  template: { destination_text: string; template_data: TripTemplateData },
  input: { title: string; start_date: string; end_date: string },
): Promise<Trip> {
  const data = template.template_data;
  const trip = await createTripInApi(
    {
      title: input.title,
      destination_text: template.destination_text,
      start_date: input.start_date,
      end_date: input.end_date,
      status: 'planned',
      budget_cents: data.budget_cents ?? undefined,
      currency: data.currency ?? undefined,
      constraints: (data.constraints as Record<string, unknown> | null) ?? undefined,
    },
    userId,
  );

  if (data.timezone) {
    await (supabase.from('trips') as any).update({ timezone: data.timezone }).eq('id', trip.id);
  }

  if (data.days.length > 0) {
    await persistClonedItinerary(
      trip.id,
      input.start_date,
      input.start_date,
      input.end_date,
      data.currency ?? null,
      [],
      {},
      data.days,
    );
  }

  const { data: refreshed, error: refreshError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', trip.id)
    .single();

  if (refreshError) throw refreshError;
  return mapTripFromDb(refreshed);
}
