import { supabase } from '@/lib/supabase';
import type { Trip, TripConstraints } from '@/lib/types/database.types';
import type { GetState } from '@/lib/store/types';

type Tab = 'itinerary' | 'chat' | 'weather' | 'explore';

export interface LoadTripDataParams {
  tripId: string;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setCurrentTrip: (t: Trip | null) => void;
  setEditForm: (f: (prev: any) => any) => void;
  setTripMembers: (m: any[]) => void;
  setActivityParticipantsMap: (m: Record<string, string[]>) => void;
  setActiveTabState: (t: Tab) => void;
  navigate: (path: string) => void;
  t: (key: string) => string;
  getState: GetState;
}

export async function loadTripDataForDetail(params: LoadTripDataParams): Promise<void> {
  const {
    tripId,
    setLoading,
    setError,
    setCurrentTrip,
    setEditForm,
    setTripMembers,
    setActivityParticipantsMap,
    setActiveTabState,
    navigate,
    t,
    getState,
  } = params;

  setLoading(true);
  setError(null);
  try {
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .is('deleted_at', null)
      .single();

    if (tripError) throw tripError;
    if (!trip) {
      navigate('/dashboard');
      return;
    }

    const tripData = trip as any;
    const mappedTrip: Trip = {
      id: tripData.id,
      owner_id: tripData.owner_id,
      title: tripData.title,
      destination_text: tripData.destination_text,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      status: tripData.status,
      budget_cents: tripData.budget_cents ?? null,
      currency: tripData.currency ?? null,
      constraints: tripData.constraints ?? null,
      created_at: tripData.created_at,
      updated_at: tripData.updated_at,
      deleted_at: tripData.deleted_at ?? null,
    };
    setCurrentTrip(mappedTrip);
    const c = mappedTrip.constraints as TripConstraints | null;
    setEditForm(() => ({
      title: mappedTrip.title,
      destination_text: mappedTrip.destination_text,
      start_date: mappedTrip.start_date,
      end_date: mappedTrip.end_date,
      status: mappedTrip.status,
      pace: (c?.pace as 'relaxed' | 'balanced' | 'packed') || 'balanced',
      budget: c?.budget_per_person_cents ? String(Math.round(c.budget_per_person_cents / 100)) : '',
      currency: mappedTrip.currency || 'EUR',
      has_children: !!c?.has_children,
    }));
    try {
      const saved = sessionStorage.getItem(`tripDetail:tab:${tripId}`);
      if (saved && ['itinerary', 'chat', 'weather', 'explore'].includes(saved)) {
        setActiveTabState(saved as Tab);
      }
    } catch {
      /* ignore */
    }

    const { data: members, error: membersError } = await supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .is('removed_at', null);
    if (membersError) console.error('Error loading trip members:', membersError);
    else setTripMembers(members || []);

    const { loadActivities, loadVotes } = getState();
    await loadActivities(tripId);
    const { activities } = getState();
    if (activities.length > 0) {
      await loadVotes(activities.map((a) => a.id));
      const activityIds = activities.map((a) => a.id);
      const { data: participantsRows } = await supabase
        .from('activity_participants')
        .select('activity_id, user_id')
        .in('activity_id', activityIds);
      const map: Record<string, string[]> = {};
      for (const row of participantsRows || []) {
        const aid = (row as { activity_id: string; user_id: string }).activity_id;
        if (!map[aid]) map[aid] = [];
        map[aid].push((row as { activity_id: string; user_id: string }).user_id);
      }
      setActivityParticipantsMap(map);
    } else {
      setActivityParticipantsMap({});
    }
  } catch (err: any) {
    console.error('Error loading trip:', err);
    setError(err.message || t('errors.failedToLoadTrip'));
  } finally {
    setLoading(false);
  }
}
