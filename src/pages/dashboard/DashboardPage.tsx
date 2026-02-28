import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { Trip } from '@/lib/mock-supabase';
import { supabase } from '@/lib/supabase';
import { subscribeToTrips, RealtimePayload, unsubscribeFromChannel } from '@/lib/realtime-service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CreateTripModal, TripCard, TripStats, DashboardHero } from '@/features/trips';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSearchFilters } from './DashboardSearchFilters';
import { DashboardLoadingState } from './DashboardLoadingState';
import { DashboardErrorState } from './DashboardErrorState';
import { DashboardEmptyState } from './DashboardEmptyState';
import type { StatusFilter, SortOption } from './types';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [tripMemberCounts, setTripMemberCounts] = useState<Record<string, number>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const tripsSubscriptionRef = useRef<RealtimeChannel | null>(null);

  const user = useStore((state) => state.user);
  const trips = useStore((state) => state.trips);
  const loadTrips = useStore((state) => state.loadTrips);
  const signOut = useStore((state) => state.signOut);
  const deleteTrip = useStore((state) => state.deleteTrip);
  const updateTrip = useStore((state) => state.updateTrip);
  const showCreateTripModal = useStore((state) => state.showCreateTripModal);
  const setShowCreateTripModal = useStore((state) => state.setShowCreateTripModal);

  const loadTripsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await loadTrips();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('dashboard.errorLoadingTrips');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user, loadTrips, t]);

  useEffect(() => {
    if (trips.length === 0) {
      setTripMemberCounts({});
      return;
    }
    const tripIds = trips.map((trip) => trip.id);
    supabase
      .from('trip_members')
      .select('trip_id')
      .in('trip_id', tripIds)
      .is('removed_at', null)
      .then(({ data, error: countsError }) => {
        if (countsError || !data) return;
        const counts: Record<string, number> = {};
        (data as { trip_id: string }[]).forEach((m) => {
          counts[m.trip_id] = (counts[m.trip_id] ?? 0) + 1;
        });
        setTripMemberCounts(counts);
      });
  }, [trips]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTripsData();
  }, [user, navigate, loadTripsData]);

  useEffect(() => {
    if (!user) return;
    tripsSubscriptionRef.current = subscribeToTrips((payload: RealtimePayload) => {
      if (payload.eventType === 'INSERT') loadTripsData();
      else if (payload.eventType === 'UPDATE' && payload.new) {
        const raw = payload.new as Record<string, unknown>;
        const mapped: Trip = {
          id: raw.id as string,
          owner_id: raw.owner_id as string,
          title: raw.title as string,
          destination_text: raw.destination_text as string,
          start_date: raw.start_date as string,
          end_date: raw.end_date as string,
          status: raw.status as Trip['status'],
          budget_cents: (raw.budget_cents as number) ?? undefined,
          currency: (raw.currency as string) ?? undefined,
          constraints: (raw.constraints as Trip['constraints']) ?? undefined,
          created_at: raw.created_at as string,
          updated_at: raw.updated_at as string,
        };
        const { trips: cur, setTrips } = useStore.getState();
        if (cur.some((t) => t.id === mapped.id)) {
          setTrips(cur.map((t) => (t.id === mapped.id ? mapped : t)));
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const { trips: cur, setTrips } = useStore.getState();
        setTrips(cur.filter((t) => t.id !== (payload.old as { id: string })?.id));
      }
    });
    return () => {
      if (tripsSubscriptionRef.current) {
        unsubscribeFromChannel(tripsSubscriptionRef.current);
        tripsSubscriptionRef.current = null;
      }
    };
  }, [user, loadTripsData]);

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenuId]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      // ignore
    }
  }, [signOut, navigate]);

  const handleDeleteTrip = useCallback(
    async (tripId: string) => {
      if (!window.confirm(t('trip.confirmDeleteTrip'))) return;
      try {
        await deleteTrip(tripId);
      } catch {
        // ignore
      }
    },
    [deleteTrip, t],
  );

  const handleArchiveTrip = useCallback(
    async (tripId: string) => {
      try {
        await updateTrip(tripId, { status: 'archived' });
      } catch {
        // ignore
      }
    },
    [updateTrip],
  );

  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips;
    if (statusFilter !== 'all') filtered = filtered.filter((t) => t.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.destination_text.toLowerCase().includes(q),
      );
    }
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [trips, statusFilter, searchQuery, sortBy]);

  if (loading) return <DashboardLoadingState />;
  if (error) return <DashboardErrorState message={error} onRetry={loadTripsData} />;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && <DashboardHero user={user} onCreateTrip={() => setShowCreateTripModal(true)} />}
        {trips.length > 0 && <TripStats trips={trips} />}

        <DashboardSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {filteredAndSortedTrips.length === 0 ? (
          <DashboardEmptyState
            hasTrips={trips.length > 0}
            onCreateTrip={() => setShowCreateTripModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                memberCount={tripMemberCounts[trip.id] ?? 0}
                isMenuOpen={openMenuId === trip.id}
                onToggleMenu={() => setOpenMenuId(openMenuId === trip.id ? null : trip.id)}
                onClick={() => navigate(`/trip/${trip.id}`)}
                onArchive={() => handleArchiveTrip(trip.id)}
                onDelete={() => handleDeleteTrip(trip.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateTripModal && <CreateTripModal onClose={() => setShowCreateTripModal(false)} />}
    </div>
  );
}
