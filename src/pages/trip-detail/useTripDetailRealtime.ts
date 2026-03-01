import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Activity, Vote, Trip } from '@/lib/mock-supabase';
import {
  subscribeToTrip,
  subscribeToMessages,
  subscribeToActivities,
  subscribeToVotes,
  RealtimePayload,
  unsubscribeFromChannel,
} from '@/lib/realtime-service';
import { RealtimeChannel } from '@supabase/supabase-js';

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

  const tripSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const messagesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const activitiesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const votesSubscriptionRef = useRef<RealtimeChannel | null>(null);

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
            const a = payload.new as any;
            if (a.trip_id !== tripId) return;
            const mapped: Activity = {
              id: a.id,
              trip_id: a.trip_id,
              itinerary_day_id: a.itinerary_day_id || undefined,
              title: a.title,
              description: a.description || '',
              category: a.category || '',
              start_time: a.start_time || undefined,
              end_time: a.end_time || undefined,
              cost_cents: a.cost_cents ?? undefined,
              lat: a.lat ?? undefined,
              lon: a.lon ?? undefined,
              status: a.status,
              source: a.source,
              created_at: a.created_at,
            };
            addActivity(mapped);
            loadVotes([mapped.id]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const a = payload.new as any;
            if (a.trip_id !== tripId) return;
            updateActivityInState(a.id, {
              title: a.title,
              description: a.description || '',
              category: a.category || '',
              start_time: a.start_time || undefined,
              end_time: a.end_time || undefined,
              cost_cents: a.cost_cents ?? undefined,
              lat: a.lat ?? undefined,
              lon: a.lon ?? undefined,
              status: a.status,
              source: a.source,
            });
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
    loadVotes,
  ]);
}
