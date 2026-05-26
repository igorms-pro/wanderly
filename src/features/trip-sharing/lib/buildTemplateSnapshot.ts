import type { Activity, Trip } from '@/lib/types/database.types';
import type { TemplateDaySnapshot, TripTemplateData } from '../types';
import { tripDurationDays } from './shiftTripDates';

type DayRow = { id: string; date: string; day_index: number | null };

export function buildTemplateSnapshot(
  trip: Pick<
    Trip,
    'start_date' | 'end_date' | 'constraints' | 'budget_cents' | 'currency' | 'timezone'
  >,
  dayRows: DayRow[],
  activitiesByDayId: Record<string, Activity[]>,
): TripTemplateData {
  const sortedDays = [...dayRows].sort((a, b) => a.date.localeCompare(b.date));
  const anchorDate = sortedDays[0]?.date ?? trip.start_date;

  const days: TemplateDaySnapshot[] = sortedDays.map((day) => {
    const offset = Math.round(
      (new Date(`${day.date}T00:00:00Z`).getTime() -
        new Date(`${anchorDate}T00:00:00Z`).getTime()) /
        (24 * 60 * 60 * 1000),
    );

    const activities = (activitiesByDayId[day.id] ?? []).map((activity) => ({
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
      status: activity.status,
      source: activity.source,
    }));

    return { day_offset: Math.max(0, offset), activities };
  });

  return {
    constraints: (trip.constraints as TripTemplateData['constraints']) ?? null,
    budget_cents: trip.budget_cents ?? null,
    currency: trip.currency ?? null,
    timezone: trip.timezone ?? 'UTC',
    duration_days: tripDurationDays(trip.start_date, trip.end_date),
    days,
  };
}
