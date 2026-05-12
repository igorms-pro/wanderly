import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Realtime service for subscribing to database changes
 * Provides subscriptions for trips, messages, activities, and votes
 */

export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
}

/**
 * Subscribe to trip updates for a specific trip
 */
export const subscribeToTrip = (
  tripId: string,
  callback: (payload: RealtimePayload) => void,
): RealtimeChannel => {
  return supabase
    .channel(`trip:${tripId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        });
      },
    )
    .subscribe();
};

/**
 * Subscribe to messages for a specific trip
 */
export const subscribeToMessages = (
  tripId: string,
  callback: (payload: RealtimePayload) => void,
): RealtimeChannel => {
  return supabase
    .channel(`trip:${tripId}:messages`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        });
      },
    )
    .subscribe();
};

/**
 * Subscribe to activities for a specific trip
 */
export const subscribeToActivities = (
  tripId: string,
  callback: (payload: RealtimePayload) => void,
): RealtimeChannel => {
  return supabase
    .channel(`trip:${tripId}:activities`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        });
      },
    )
    .subscribe();
};

/**
 * Subscribe to votes for activities in a specific trip
 * Note: This subscribes to all votes, filtering by activity_id is done client-side
 */
export const subscribeToVotes = (
  tripId: string,
  callback: (payload: RealtimePayload) => void,
): RealtimeChannel => {
  // Subscribe to votes table and filter by checking if activity belongs to trip
  // This requires a more complex setup, so we'll use a simpler approach
  // subscribing to all votes and filtering client-side
  return supabase
    .channel(`trip:${tripId}:votes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'votes',
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        });
      },
    )
    .subscribe();
};

/** Scenario (itinerary) votes for the current trip — filtered server-side by trip_id */
export const subscribeToItineraryVotes = (
  tripId: string,
  callback: (payload: RealtimePayload) => void,
): RealtimeChannel => {
  return supabase
    .channel(`trip:${tripId}:itinerary_votes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'itinerary_votes',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        });
      },
    )
    .subscribe();
};

/**
 * Subscribe to all trips for the current user
 * This listens to the trips table for any changes
 */
export const subscribeToTrips = (callback: (payload: RealtimePayload) => void): RealtimeChannel => {
  return supabase
    .channel('trips:all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new,
          old: payload.old,
        });
      },
    )
    .subscribe();
};

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = (channel: RealtimeChannel): void => {
  supabase.removeChannel(channel);
};
