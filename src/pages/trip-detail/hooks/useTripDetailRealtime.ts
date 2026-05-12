import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../lib/store';
import type { Activity, Vote, Trip, ItineraryVote } from '../../../lib/types/database.types';
import {
  subscribeToTrip,
  subscribeToMessages,
  subscribeToActivities,
  subscribeToVotes,
  subscribeToItineraryVotes,
  RealtimePayload,
  unsubscribeFromChannel,
} from '../../../lib/realtime-service';
import { RealtimeChannel } from '@supabase/supabase-js';

function mapActivityRow(row: Record<string, unknown>): Activity {
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

/** Subscribes to trip, messages, activities, votes realtime. Cleanup on unmount or tripId change. */
export function useTripDetailRealtime(tripId: string | undefined) {
  const navigate = useNavigate();
  const setCurrentTrip = useStore((s) => s.setCurrentTrip);
  const updateTrip = useStore((s) => s.updateTrip);
  const addActivity = useStore((s) => s.addActivity);
  const updateActivityInState = useStore((s) => s.updateActivityInState);
  const setActivities = useStore((s) => s.setActivities);
  const setVotes = useStore((s) => s.setVotes);
  const loadVotes = useStore((s) => s.loadVotes);
  const setItineraryVotes = useStore((s) => s.setItineraryVotes);

  const tripSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const messagesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const activitiesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const votesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const itineraryVotesSubscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tripId) return;

    tripSubscriptionRef.current = subscribeToTrip(tripId, (payload: RealtimePayload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        const d = payload.new as any;
        const updatedTrip: Trip = {
          id: d.id,
          owner_id: d.owner_id,
          title: d.title,
          destination_text: d.destination_text,
          start_date: d.start_date,
          end_date: d.end_date,
          status: d.status,
          budget_cents: d.budget_cents ?? undefined,
          currency: d.currency ?? undefined,
          constraints: d.constraints ?? undefined,
          created_at: d.created_at,
          updated_at: d.updated_at,
        };
        setCurrentTrip(updatedTrip);
        updateTrip(tripId, updatedTrip);
      } else if (payload.eventType === 'DELETE') {
        navigate('/dashboard');
      }
    });

    messagesSubscriptionRef.current = subscribeToMessages(tripId, () => {});

    activitiesSubscriptionRef.current = subscribeToActivities(
      tripId,
      (payload: RealtimePayload) => {
        try {
          if (payload.eventType === 'INSERT' && payload.new) {
            const a = payload.new as Record<string, unknown>;
            if (a.trip_id !== tripId) return;
            const mapped = mapActivityRow(a);
            addActivity(mapped);
            loadVotes([mapped.id]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const a = payload.new as Record<string, unknown>;
            if (a.trip_id !== tripId) return;
            const mapped = mapActivityRow(a);
            updateActivityInState(mapped.id, mapped);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const id = (payload.old as any)?.id;
            if (!id) return;
            const { activities: cur } = useStore.getState();
            setActivities(cur.filter((x) => x.id !== id));
            const { votes: vcur } = useStore.getState();
            const next = { ...vcur };
            delete next[id];
            setVotes(next);
          }
        } catch (e) {
          console.error('Error handling activities real-time event:', e);
        }
      },
    );

    itineraryVotesSubscriptionRef.current = subscribeToItineraryVotes(
      tripId,
      (payload: RealtimePayload) => {
        try {
          const { itineraryVotes: cur } = useStore.getState();
          if (payload.eventType === 'INSERT' && payload.new) {
            const r = payload.new as Record<string, unknown>;
            if (r.trip_id !== tripId || !r.itinerary_id) return;
            const mapped: ItineraryVote = {
              id: r.id as string,
              trip_id: r.trip_id as string,
              itinerary_id: r.itinerary_id as string,
              user_id: r.user_id as string,
              choice: r.choice as 'up' | 'down',
              created_at: r.created_at as string,
            };
            const list = cur[mapped.itinerary_id] || [];
            const withoutUser = list.filter((x) => x.user_id !== mapped.user_id);
            setItineraryVotes({
              ...cur,
              [mapped.itinerary_id]: [...withoutUser, mapped],
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const r = payload.new as Record<string, unknown>;
            if (r.trip_id !== tripId || !r.itinerary_id) return;
            const mapped: ItineraryVote = {
              id: r.id as string,
              trip_id: r.trip_id as string,
              itinerary_id: r.itinerary_id as string,
              user_id: r.user_id as string,
              choice: r.choice as 'up' | 'down',
              created_at: r.created_at as string,
            };
            const list = cur[mapped.itinerary_id] || [];
            const withoutUser = list.filter((x) => x.user_id !== mapped.user_id);
            setItineraryVotes({
              ...cur,
              [mapped.itinerary_id]: [...withoutUser, mapped],
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const r = payload.old as Record<string, unknown>;
            const itineraryId = r.itinerary_id as string | undefined;
            const voteId = r.id as string | undefined;
            if (!itineraryId || !voteId) return;
            const list = cur[itineraryId] || [];
            setItineraryVotes({
              ...cur,
              [itineraryId]: list.filter((x) => x.id !== voteId),
            });
          }
        } catch (e) {
          console.error('Error handling itinerary votes real-time event:', e);
        }
      },
    );

    votesSubscriptionRef.current = subscribeToVotes(tripId, (payload: RealtimePayload) => {
      try {
        const { activities: curActivities } = useStore.getState();
        const { votes: curVotes } = useStore.getState();
        if (payload.eventType === 'INSERT' && payload.new) {
          const v = payload.new as any;
          const act = curActivities.find((x) => x.id === v.activity_id);
          if (!act || act.trip_id !== tripId) return;
          const mapped: Vote = {
            id: v.id,
            activity_id: v.activity_id,
            user_id: v.user_id,
            choice: v.choice,
            created_at: v.created_at,
          };
          const list = curVotes[v.activity_id] || [];
          if (!list.find((x) => x.id === v.id)) {
            setVotes({ ...curVotes, [v.activity_id]: [...list, mapped] });
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const v = payload.new as any;
          const act = curActivities.find((x) => x.id === v.activity_id);
          if (!act || act.trip_id !== tripId) return;
          const mapped: Vote = {
            id: v.id,
            activity_id: v.activity_id,
            user_id: v.user_id,
            choice: v.choice,
            created_at: v.created_at,
          };
          const list = curVotes[v.activity_id] || [];
          setVotes({
            ...curVotes,
            [v.activity_id]: list.map((x) => (x.id === v.id ? mapped : x)),
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const v = payload.old as any;
          if (!v?.activity_id) return;
          const act = curActivities.find((x) => x.id === v.activity_id);
          if (!act || act.trip_id !== tripId) return;
          const list = curVotes[v.activity_id] || [];
          setVotes({
            ...curVotes,
            [v.activity_id]: list.filter((x) => x.id !== v.id),
          });
        }
      } catch (e) {
        console.error('Error handling votes real-time event:', e);
      }
    });

    return () => {
      [
        tripSubscriptionRef,
        messagesSubscriptionRef,
        activitiesSubscriptionRef,
        votesSubscriptionRef,
        itineraryVotesSubscriptionRef,
      ].forEach((ref) => {
        if (ref.current) {
          unsubscribeFromChannel(ref.current);
          ref.current = null;
        }
      });
    };
  }, [
    tripId,
    navigate,
    setCurrentTrip,
    updateTrip,
    addActivity,
    updateActivityInState,
    setActivities,
    setVotes,
    setItineraryVotes,
    loadVotes,
  ]);
}
