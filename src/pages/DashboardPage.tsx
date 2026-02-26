import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../lib/store';
import { Trip } from '../lib/mock-supabase';
import { supabase } from '../lib/supabase';
import { subscribeToTrips, RealtimePayload, unsubscribeFromChannel } from '../lib/realtime-service';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  Plus,
  Plane,
  Calendar,
  MapPin,
  LogOut,
  User,
  Sparkles,
  AlertCircle,
  Search,
  Users,
  ArrowUpDown,
} from 'lucide-react';
import { CreateTripModal } from '@/features/trips';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { format } from 'date-fns';

type StatusFilter = 'all' | 'planned' | 'locked' | 'archived';
type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [tripMemberCounts, setTripMemberCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  // Realtime subscription ref
  const tripsSubscriptionRef = useRef<RealtimeChannel | null>(null);

  const user = useStore((state) => state.user);
  const trips = useStore((state) => state.trips);
  const loadTrips = useStore((state) => state.loadTrips);
  const signOut = useStore((state) => state.signOut);
  const showCreateTripModal = useStore((state) => state.showCreateTripModal);
  const setShowCreateTripModal = useStore((state) => state.setShowCreateTripModal);

  const loadTripsData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await loadTrips();
    } catch (err: any) {
      console.error('Error loading trips:', err);
      setError(err.message || t('dashboard.errorLoadingTrips'));
    } finally {
      setLoading(false);
    }
  }, [user, loadTrips, t]);

  // Load member counts when trips change
  useEffect(() => {
    const loadMemberCounts = async () => {
      if (trips.length === 0) {
        setTripMemberCounts({});
        return;
      }

      const tripIds = trips.map((t) => t.id);
      const { data: memberCounts, error: countsError } = await supabase
        .from('trip_members')
        .select('trip_id')
        .in('trip_id', tripIds)
        .is('removed_at', null);

      if (!countsError && memberCounts) {
        const counts: Record<string, number> = {};
        ((memberCounts || []) as any[]).forEach((m: any) => {
          counts[m.trip_id] = (counts[m.trip_id] || 0) + 1;
        });
        setTripMemberCounts(counts);
      }
    };

    loadMemberCounts();
  }, [trips]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadTripsData();
  }, [user, navigate, loadTripsData]);

  // Set up realtime subscription for trips
  useEffect(() => {
    if (!user) return;

    // Subscribe to trips table changes
    tripsSubscriptionRef.current = subscribeToTrips((payload: RealtimePayload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        // New trip was created - reload trips to get user's trips
        // (since we only show trips where user is a member)
        loadTripsData();
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        // Trip was updated - update in state
        const updatedTrip = payload.new as any;
        const mappedTrip: Trip = {
          id: updatedTrip.id,
          owner_id: updatedTrip.owner_id,
          title: updatedTrip.title,
          destination_text: updatedTrip.destination_text,
          start_date: updatedTrip.start_date,
          end_date: updatedTrip.end_date,
          status: updatedTrip.status,
          budget_cents: updatedTrip.budget_cents ?? undefined,
          currency: updatedTrip.currency ?? undefined,
          created_at: updatedTrip.created_at,
          updated_at: updatedTrip.updated_at,
        };

        // Update trip in state if it exists
        const { trips, setTrips } = useStore.getState();
        const tripExists = trips.find((t) => t.id === mappedTrip.id);
        if (tripExists) {
          setTrips(trips.map((t) => (t.id === mappedTrip.id ? mappedTrip : t)));
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        // Trip was deleted - remove from state
        const { trips, setTrips } = useStore.getState();
        setTrips(trips.filter((t) => t.id !== payload.old?.id));
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (tripsSubscriptionRef.current) {
        unsubscribeFromChannel(tripsSubscriptionRef.current);
        tripsSubscriptionRef.current = null;
      }
    };
  }, [user, loadTripsData]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleTripClick = (trip: Trip) => {
    navigate(`/trip/${trip.id}`);
  };

  // Filter and sort trips
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((trip) => trip.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.title.toLowerCase().includes(query) ||
          trip.destination_text.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
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

    return sorted;
  }, [trips, statusFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('dashboard.loadingTrips')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('dashboard.errorLoadingTrips')}
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadTripsData}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {t('trip.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">Voyagely</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <LanguageSwitcher variant="dropdown" size="md" />
                <ThemeToggle />
              </div>
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar_url}
                  alt={user?.display_name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.display_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('trip.welcomeBack', { name: user?.display_name })}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{t('trip.planAdventure')}</p>
        </div>

        {/* Controls Section */}
        <div className="mb-8 space-y-4">
          {/* Create Trip Button */}
          <div>
            <button
              onClick={() => setShowCreateTripModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t('trip.createTripWithAI')}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('trip.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="date-desc">{t('trip.newestFirst')}</option>
                  <option value="date-asc">{t('trip.oldestFirst')}</option>
                  <option value="title-asc">{t('trip.titleAZ')}</option>
                  <option value="title-desc">{t('trip.titleZA')}</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Status Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('trip.all')}
              </button>
              <button
                onClick={() => setStatusFilter('planned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'planned'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('trip.planned')}
              </button>
              <button
                onClick={() => setStatusFilter('locked')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'locked'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('trip.locked')}
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'archived'
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('trip.archived')}
              </button>
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {filteredAndSortedTrips.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Plane className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {trips.length === 0 ? t('trip.noTripsYet') : t('trip.noTripsMatch')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {trips.length === 0 ? t('trip.getStartedMessage') : t('trip.tryAdjustingFilters')}
            </p>
            <button
              onClick={() => setShowCreateTripModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('trip.createFirstTrip')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition cursor-pointer overflow-hidden"
              >
                {/* Trip Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white opacity-50" />
                </div>

                {/* Trip Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {trip.title}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{trip.destination_text}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(trip.start_date), 'MMM d')} -{' '}
                      {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Member Count */}
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {tripMemberCounts[trip.id] || 0}{' '}
                      {(tripMemberCounts[trip.id] || 0) === 1
                        ? t('trip.member')
                        : t('trip.members')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        trip.status === 'planned'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : trip.status === 'locked'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(`trip.${trip.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      {showCreateTripModal && <CreateTripModal onClose={() => setShowCreateTripModal(false)} />}
    </div>
  );
}
