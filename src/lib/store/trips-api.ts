import type { Trip } from '../types/database.types';
import { supabase } from '../supabase';
import type { CreateTripData } from './types';

export function mapTripFromDb(raw: any): Trip {
  return {
    id: raw.id,
    owner_id: raw.owner_id,
    title: raw.title,
    destination_text: raw.destination_text,
    start_date: raw.start_date,
    end_date: raw.end_date,
    status: raw.status,
    budget_cents: raw.budget_cents ?? undefined,
    currency: raw.currency ?? undefined,
    constraints: raw.constraints ?? undefined,
    active_itinerary_id: raw.active_itinerary_id ?? undefined,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export async function loadTripsFromApi(): Promise<Trip[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships, error: membershipsError } = await supabase
    .from('trip_members')
    .select('trip_id')
    .eq('user_id', user.id)
    .is('removed_at', null);

  if (membershipsError) throw membershipsError;
  if (!memberships || memberships.length === 0) return [];

  const tripIds = (memberships as { trip_id: string }[]).map((m) => m.trip_id);

  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .in('id', tripIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (tripsError) throw tripsError;

  return ((trips || []) as any[]).map(mapTripFromDb);
}

export async function createTripInApi(tripData: CreateTripData, userId: string): Promise<Trip> {
  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      owner_id: userId,
      title: tripData.title,
      destination_text: tripData.destination_text,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      status: tripData.status || 'planned',
      budget_cents: tripData.budget_cents ?? null,
      currency: tripData.currency ?? null,
      constraints: tripData.constraints ?? null,
    } as any)
    .select()
    .single();

  if (error) throw error;
  if (!trip) throw new Error('Failed to create trip');

  return mapTripFromDb(trip);
}

export async function updateTripInApi(
  tripId: string,
  updateData: Record<string, unknown>,
): Promise<Trip> {
  const { data: trip, error } = await (supabase.from('trips') as any)
    .update(updateData)
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  if (!trip) throw new Error('Trip not found');

  return mapTripFromDb(trip);
}
