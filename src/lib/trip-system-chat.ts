import { supabase } from '@/lib/supabase';

export type TripSystemPayload =
  | { v: 1; kind: 'trip_finalized' }
  | {
      v: 1;
      kind: 'activity_change';
      title: string;
      change: 'created' | 'updated' | 'removed';
    };

type TripRef = { id: string; status: 'planned' | 'locked' | 'archived' } | null;

export function parseTripSystemPayload(raw: string): TripSystemPayload | null {
  try {
    const o = JSON.parse(raw) as TripSystemPayload;
    if (o?.v !== 1 || !o.kind) return null;
    return o;
  } catch {
    return null;
  }
}

export async function insertTripSystemMessage(
  tripId: string,
  payload: TripSystemPayload,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('messages').insert({
    trip_id: tripId,
    user_id: user.id,
    message_type: 'system',
    content: JSON.stringify(payload),
  } as any);

  if (error) {
    console.error('insertTripSystemMessage:', error);
  }
}

export async function insertTripFinalizedChatMessage(tripId: string): Promise<void> {
  await insertTripSystemMessage(tripId, { v: 1, kind: 'trip_finalized' });
}

export function maybePostLockedTripActivityChatMessage(
  getCurrentTrip: () => TripRef,
  tripId: string,
  detail: { title: string; change: 'created' | 'updated' | 'removed' },
): void {
  const trip = getCurrentTrip();
  if (!trip || trip.id !== tripId || trip.status !== 'locked') return;
  void insertTripSystemMessage(tripId, {
    v: 1,
    kind: 'activity_change',
    title: detail.title,
    change: detail.change,
  });
}
