import type { Activity } from '../types/database.types';

export function mapRowToActivity(row: Record<string, unknown>): Activity {
  const r = row as any;
  return {
    id: r.id,
    trip_id: r.trip_id,
    itinerary_day_id: r.itinerary_day_id ?? undefined,
    place_id: r.place_id ?? undefined,
    place_name: r.place_name ?? undefined,
    title: r.title,
    description: r.description ?? '',
    category: r.category ?? '',
    start_time: r.start_time ?? undefined,
    end_time: r.end_time ?? undefined,
    cost_cents: r.cost_cents ?? undefined,
    cost_min_cents: r.cost_min_cents ?? undefined,
    cost_max_cents: r.cost_max_cents ?? undefined,
    currency: r.currency ?? undefined,
    transport_type: r.transport_type ?? undefined,
    transport_notes: r.transport_notes ?? undefined,
    transport_duration_minutes: r.transport_duration_minutes ?? undefined,
    transport_cost_cents: r.transport_cost_cents ?? undefined,
    organizer_notes: r.organizer_notes ?? undefined,
    packing_checklist: r.packing_checklist ?? null,
    lat: r.lat ?? undefined,
    lon: r.lon ?? undefined,
    status: r.status,
    source: r.source,
    created_at: r.created_at,
    order_index: r.order_index ?? undefined,
  };
}
