import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Activity, Vote, Trip, Message } from '../lib/mock-supabase';
import { TripMember, Message as DBMessage } from '../lib/types/database.types';
import {
  subscribeToTrip,
  subscribeToMessages,
  subscribeToActivities,
  subscribeToVotes,
  RealtimePayload,
  unsubscribeFromChannel,
} from '../lib/realtime-service';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  Sparkles,
  Cloud,
  Navigation as NavigationIcon,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { TripChat } from '@/features/chat';
import WeatherWidget from '@/components/WeatherWidget';
import NearbyPlaces from '@/components/NearbyPlaces';
import { CreateActivityModal } from '@/features/activities';

export default function TripDetailPage() {
  const { t } = useTranslation();
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'chat' | 'weather' | 'explore'>(
    'itinerary',
  );
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    destination_text: '',
    start_date: '',
    end_date: '',
    status: 'planned' as 'planned' | 'locked' | 'archived',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [votingActivityId, setVotingActivityId] = useState<string | null>(null);

  // Realtime subscriptions refs
  const tripSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const messagesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const activitiesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const votesSubscriptionRef = useRef<RealtimeChannel | null>(null);

  const user = useStore((state) => state.user);
  const currentTrip = useStore((state) => state.currentTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);
  const updateTrip = useStore((state) => state.updateTrip);
  const deleteTrip = useStore((state) => state.deleteTrip);
  const activities = useStore((state) => state.activities);
  const loadActivities = useStore((state) => state.loadActivities);
  const addActivity = useStore((state) => state.addActivity);
  const updateActivityInState = useStore((state) => state.updateActivityInState);
  const setActivities = useStore((state) => state.setActivities);
  const votes = useStore((state) => state.votes);
  const setVotes = useStore((state) => state.setVotes);
  const loadVotes = useStore((state) => state.loadVotes);
  const createOrUpdateVote = useStore((state) => state.createOrUpdateVote);
  const showAddActivityModal = useStore((state) => state.showAddActivityModal);
  const setShowAddActivityModal = useStore((state) => state.setShowAddActivityModal);

  const loadTripData = useCallback(async () => {
    if (!tripId || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Load trip from Supabase
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .is('deleted_at', null)
        .single();

      if (tripError) {
        console.error('Error loading trip:', tripError);
        throw tripError;
      }

      if (!trip) {
        navigate('/dashboard');
        return;
      }

      // Map database Trip to mock Trip format
      const tripData = trip as any; // Type assertion needed due to Supabase type inference
      const mappedTrip: Trip = {
        id: tripData.id,
        owner_id: tripData.owner_id,
        title: tripData.title,
        destination_text: tripData.destination_text,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        status: tripData.status,
        budget_cents: tripData.budget_cents ?? undefined,
        currency: tripData.currency ?? undefined,
        created_at: tripData.created_at,
        updated_at: tripData.updated_at,
      };

      setCurrentTrip(mappedTrip);
      setEditForm({
        title: mappedTrip.title,
        destination_text: mappedTrip.destination_text,
        start_date: mappedTrip.start_date,
        end_date: mappedTrip.end_date,
        status: mappedTrip.status,
      });

      // Load trip members
      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .is('removed_at', null);

      if (membersError) {
        console.error('Error loading trip members:', membersError);
      } else {
        setTripMembers(members || []);
      }

      // Load activities for this trip
      await loadActivities(tripId);

      // Load votes for all activities after activities are loaded
      const { activities: currentActivities } = useStore.getState();
      if (currentActivities.length > 0) {
        const activityIds = currentActivities.map((a) => a.id);
        await loadVotes(activityIds);
      }
    } catch (err: any) {
      console.error('Error loading trip:', err);
      setError(err.message || t('errors.failedToLoadTrip'));
    } finally {
      setLoading(false);
    }
  }, [tripId, user, navigate, setCurrentTrip, loadActivities, loadVotes, t]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!tripId) {
      navigate('/dashboard');
      return;
    }

    loadTripData();
  }, [tripId, user, navigate, loadTripData]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!tripId || !user) return;

    // Subscribe to trip updates
    tripSubscriptionRef.current = subscribeToTrip(tripId, (payload: RealtimePayload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        // Update trip in state
        const updatedTripData = payload.new as any;
        const updatedTrip: Trip = {
          id: updatedTripData.id,
          owner_id: updatedTripData.owner_id,
          title: updatedTripData.title,
          destination_text: updatedTripData.destination_text,
          start_date: updatedTripData.start_date,
          end_date: updatedTripData.end_date,
          status: updatedTripData.status,
          budget_cents: updatedTripData.budget_cents ?? undefined,
          currency: updatedTripData.currency ?? undefined,
          created_at: updatedTripData.created_at,
          updated_at: updatedTripData.updated_at,
        };
        setCurrentTrip(updatedTrip);
        updateTrip(tripId, updatedTrip);
      } else if (payload.eventType === 'DELETE') {
        // Trip was deleted, navigate away
        navigate('/dashboard');
      }
    });

    // Subscribe to messages
    messagesSubscriptionRef.current = subscribeToMessages(tripId, (payload: RealtimePayload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const message = payload.new as DBMessage;
        // Map to Message format
        const mappedMessage: Message = {
          id: message.id,
          trip_id: message.trip_id,
          user_id: message.user_id || '',
          content: message.content,
          message_type: message.message_type === 'attachment' ? 'text' : message.message_type,
          created_at: message.created_at,
        };
        // Add message to store
        // Note: This will be handled by TripChat component, but we can also update store here
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        // Message was updated
        const message = payload.new as DBMessage;
        // Update message in store if needed
      } else if (payload.eventType === 'DELETE') {
        // Message was deleted
        // Remove from store if needed
      }
    });

    // Subscribe to activities
    activitiesSubscriptionRef.current = subscribeToActivities(
      tripId,
      (payload: RealtimePayload) => {
        try {
          if (payload.eventType === 'INSERT' && payload.new) {
            const activity = payload.new as any;
            // Only process if activity belongs to this trip (safety check)
            if (activity.trip_id !== tripId) return;

            // Map to Activity format
            const mappedActivity: Activity = {
              id: activity.id,
              trip_id: activity.trip_id,
              itinerary_day_id: activity.itinerary_day_id || undefined,
              title: activity.title,
              description: activity.description || '',
              category: activity.category || '',
              start_time: activity.start_time || undefined,
              end_time: activity.end_time || undefined,
              cost_cents: activity.cost_cents ?? undefined,
              lat: activity.lat ?? undefined,
              lon: activity.lon ?? undefined,
              status: activity.status,
              source: activity.source,
              created_at: activity.created_at,
            };
            // Use store function to add activity
            addActivity(mappedActivity);
            // Load votes for the new activity
            loadVotes([mappedActivity.id]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const activity = payload.new as any;
            // Only process if activity belongs to this trip (safety check)
            if (activity.trip_id !== tripId) return;

            // Map updates to Activity format
            const updates: Partial<Activity> = {
              title: activity.title,
              description: activity.description || '',
              category: activity.category || '',
              start_time: activity.start_time || undefined,
              end_time: activity.end_time || undefined,
              cost_cents: activity.cost_cents ?? undefined,
              lat: activity.lat ?? undefined,
              lon: activity.lon ?? undefined,
              status: activity.status,
              source: activity.source,
            };
            // Use store function to update activity
            updateActivityInState(activity.id, updates);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const activityId = payload.old?.id;
            if (!activityId) return;
            // Remove activity from state (soft delete - already filtered by deleted_at in queries)
            const { activities: currentActivities } = useStore.getState();
            setActivities(currentActivities.filter((a) => a.id !== activityId));
            // Also remove votes for this activity
            const { votes: currentVotes } = useStore.getState();
            const updatedVotes = { ...currentVotes };
            delete updatedVotes[activityId];
            setVotes(updatedVotes);
          }
        } catch (error) {
          console.error('Error handling activities real-time event:', error);
        }
      },
    );

    // Subscribe to votes
    votesSubscriptionRef.current = subscribeToVotes(tripId, (payload: RealtimePayload) => {
      try {
        if (payload.eventType === 'INSERT' && payload.new) {
          const vote = payload.new as any;
          // Check if this vote is for an activity in the current trip
          const { activities: currentActivities } = useStore.getState();
          const activity = currentActivities.find((a) => a.id === vote.activity_id);
          if (!activity || activity.trip_id !== tripId) return;

          // Map to Vote format
          const mappedVote: Vote = {
            id: vote.id,
            activity_id: vote.activity_id,
            user_id: vote.user_id,
            choice: vote.choice,
            created_at: vote.created_at,
          };

          // Add vote to store
          const { votes: currentVotes } = useStore.getState();
          const activityVotes = currentVotes[vote.activity_id] || [];
          // Check if vote already exists (avoid duplicates)
          const existingVote = activityVotes.find((v) => v.id === vote.id);
          if (!existingVote) {
            setVotes({
              ...currentVotes,
              [vote.activity_id]: [...activityVotes, mappedVote],
            });
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const vote = payload.new as any;
          // Check if this vote is for an activity in the current trip
          const { activities: currentActivities } = useStore.getState();
          const activity = currentActivities.find((a) => a.id === vote.activity_id);
          if (!activity || activity.trip_id !== tripId) return;

          // Map to Vote format
          const mappedVote: Vote = {
            id: vote.id,
            activity_id: vote.activity_id,
            user_id: vote.user_id,
            choice: vote.choice,
            created_at: vote.created_at,
          };

          // Update vote in store
          const { votes: currentVotes } = useStore.getState();
          const activityVotes = currentVotes[vote.activity_id] || [];
          setVotes({
            ...currentVotes,
            [vote.activity_id]: activityVotes.map((v) => (v.id === vote.id ? mappedVote : v)),
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const vote = payload.old as any;
          if (!vote?.activity_id) return;

          // Check if this vote is for an activity in the current trip
          const { activities: currentActivities } = useStore.getState();
          const activity = currentActivities.find((a) => a.id === vote.activity_id);
          if (!activity || activity.trip_id !== tripId) return;

          // Remove vote from store
          const { votes: currentVotes } = useStore.getState();
          const activityVotes = currentVotes[vote.activity_id] || [];
          setVotes({
            ...currentVotes,
            [vote.activity_id]: activityVotes.filter((v) => v.id !== vote.id),
          });
        }
      } catch (error) {
        console.error('Error handling votes real-time event:', error);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      if (tripSubscriptionRef.current) {
        unsubscribeFromChannel(tripSubscriptionRef.current);
        tripSubscriptionRef.current = null;
      }
      if (messagesSubscriptionRef.current) {
        unsubscribeFromChannel(messagesSubscriptionRef.current);
        messagesSubscriptionRef.current = null;
      }
      if (activitiesSubscriptionRef.current) {
        unsubscribeFromChannel(activitiesSubscriptionRef.current);
        activitiesSubscriptionRef.current = null;
      }
      if (votesSubscriptionRef.current) {
        unsubscribeFromChannel(votesSubscriptionRef.current);
        votesSubscriptionRef.current = null;
      }
    };
  }, [
    tripId,
    user,
    navigate,
    setCurrentTrip,
    updateTrip,
    loadVotes,
    addActivity,
    updateActivityInState,
    setActivities,
    setVotes,
  ]);

  const handleUpdateTrip = async () => {
    if (!tripId || !currentTrip) return;

    try {
      await updateTrip(tripId, {
        title: editForm.title,
        destination_text: editForm.destination_text,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        status: editForm.status,
      });
      setIsEditing(false);
      // Reload trip data to get updated trip
      await loadTripData();
    } catch (err: any) {
      console.error('Error updating trip:', err);
      alert(err.message || t('errors.failedToUpdateTrip'));
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripId || !currentTrip) return;

    if (!confirm(t('tripDetail.confirmDelete'))) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTrip(tripId);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert(err.message || t('errors.failedToDeleteTrip'));
      setIsDeleting(false);
    }
  };

  const getUserRole = (): 'owner' | 'editor' | 'viewer' | 'moderator' | null => {
    if (!user) return null;
    const member = tripMembers.find((m) => m.user_id === user.id);
    return member?.role || null;
  };

  const canEdit = (): boolean => {
    if (!user || !currentTrip) return false;
    const role = getUserRole();
    return role === 'owner' || role === 'editor' || user.id === currentTrip.owner_id;
  };

  const canDelete = (): boolean => {
    if (!user || !currentTrip) return false;
    return user.id === currentTrip.owner_id;
  };

  const handleVote = async (activityId: string, choice: 'up' | 'down') => {
    if (!user) {
      alert(t('errors.mustBeLoggedIn') || 'You must be logged in to vote');
      return;
    }

    setVotingActivityId(activityId);

    // Check if user is clicking the same vote (remove vote)
    const currentVote = getUserVote(activityId);
    const isRemovingVote = currentVote === choice;

    // Store original votes for rollback
    const originalVotes = { ...votes };
    const activityVotes = votes[activityId] || [];

    try {
      if (isRemovingVote) {
        // Remove vote: optimistic update
        const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
        setVotes({
          ...votes,
          [activityId]: filteredVotes,
        });

        // Delete vote from database
        const userVote = activityVotes.find((v) => v.user_id === user.id);
        if (userVote) {
          const { error } = await supabase.from('votes').delete().eq('id', userVote.id);

          if (error) {
            throw error;
          }
        }
      } else {
        // Add/update vote: optimistic update
        const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
        const optimisticVote: Vote = {
          id: `temp-${Date.now()}`, // Temporary ID
          activity_id: activityId,
          user_id: user.id,
          choice: choice,
          created_at: new Date().toISOString(),
        };

        setVotes({
          ...votes,
          [activityId]: [...filteredVotes, optimisticVote],
        });

        // Perform actual vote
        await createOrUpdateVote(activityId, choice);
      }
    } catch (err: any) {
      console.error('Error voting:', err);

      // Rollback optimistic update on error
      setVotes(originalVotes);

      alert(err.message || t('errors.failedToVote') || 'Failed to vote. Please try again.');
    } finally {
      setVotingActivityId(null);
    }
  };

  const getVoteCounts = (activityId: string) => {
    const activityVotes = votes[activityId] || [];
    const upvotes = activityVotes.filter((v) => v.choice === 'up').length;
    const downvotes = activityVotes.filter((v) => v.choice === 'down').length;
    return { upvotes, downvotes };
  };

  const getUserVote = (activityId: string): 'up' | 'down' | null => {
    if (!user) return null;
    const activityVotes = votes[activityId] || [];
    const userVote = activityVotes.find((v) => v.user_id === user.id);
    return userVote ? userVote.choice : null;
  };

  // Group activities by date
  // Note: Since database uses TIME not TIMESTAMP, we group by created_at date
  // In the future, we may want to add a date field or use itinerary_day_id
  const activitiesByDate = activities.reduce(
    (acc, activity) => {
      // Try to extract date from start_time if it's a full timestamp
      // Otherwise use created_at date
      let date: string;
      if (activity.start_time && activity.start_time.includes('T')) {
        date = activity.start_time.split('T')[0];
      } else {
        // Use created_at date for grouping
        date = activity.created_at.split('T')[0];
      }
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    },
    {} as Record<string, Activity[]>,
  );

  const sortedDates = Object.keys(activitiesByDate).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('tripDetail.loadingTrip')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('tripDetail.errorLoadingTrip')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {t('tripDetail.backToDashboard')}
            </button>
            <button
              onClick={loadTripData}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              {t('trip.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('tripDetail.backToDashboard')}
            </button>
          </div>
        </div>
      </header>

      {/* Trip Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={t('tripDetail.tripTitlePlaceholder')}
                  />
                  <input
                    type="text"
                    value={editForm.destination_text}
                    onChange={(e) => setEditForm({ ...editForm, destination_text: e.target.value })}
                    className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder={t('tripDetail.destinationPlaceholder')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateTrip}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('tripDetail.save')}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          title: currentTrip.title,
                          destination_text: currentTrip.destination_text,
                          start_date: currentTrip.start_date,
                          end_date: currentTrip.end_date,
                          status: currentTrip.status,
                        });
                      }}
                      className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('tripDetail.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-4">{currentTrip.title}</h1>
                  <div className="flex flex-wrap gap-4 text-white/90">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      {currentTrip.destination_text}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      {format(new Date(currentTrip.start_date), 'MMM d')} -{' '}
                      {format(new Date(currentTrip.end_date), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      {tripMembers.length}{' '}
                      {tripMembers.length === 1 ? t('tripDetail.member') : t('tripDetail.members')}
                    </div>
                  </div>
                </>
              )}
            </div>
            {!isEditing && (
              <div className="flex space-x-2">
                {canEdit() && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('tripDetail.edit')}
                  </button>
                )}
                {canDelete() && (
                  <button
                    onClick={handleDeleteTrip}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-500/80 backdrop-blur-sm border border-red-400/30 rounded-lg text-white hover:bg-red-600/80 transition flex items-center disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? t('tripDetail.deleting') : t('tripDetail.delete')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'itinerary'
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('tripDetail.itinerary')}
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'weather'
                  ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Cloud className="w-4 h-4 inline mr-2" />
              {t('tripDetail.weather')}
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'explore'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <NavigationIcon className="w-4 h-4 inline mr-2" />
              {t('tripDetail.explore')}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              {t('tripDetail.chat')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'weather' ? (
          <WeatherWidget
            destination={currentTrip.destination_text}
            startDate={currentTrip.start_date}
            endDate={currentTrip.end_date}
          />
        ) : activeTab === 'explore' ? (
          <NearbyPlaces destination={currentTrip.destination_text} />
        ) : activeTab === 'itinerary' ? (
          <div className="space-y-8">
            {/* Add Activity Button */}
            {canEdit() && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center shadow-sm"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('tripDetail.addActivity')}
                </button>
              </div>
            )}

            {sortedDates.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg p-12 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {t('tripDetail.noActivitiesYet')}
                </p>
                {canEdit() && (
                  <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition inline-flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t('tripDetail.addFirstActivity')}
                  </button>
                )}
              </div>
            ) : (
              sortedDates.map((date) => (
                <div
                  key={date}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {activitiesByDate[date].length} {t('tripDetail.activities')}
                    </p>
                  </div>

                  {/* Activities */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activitiesByDate[date]
                      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                      .map((activity) => {
                        const { upvotes, downvotes } = getVoteCounts(activity.id);
                        const userVote = getUserVote(activity.id);

                        return (
                          <div
                            key={activity.id}
                            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                      {activity.title}
                                    </h4>
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                      {activity.category}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                  {activity.description}
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  {activity.start_time && activity.end_time && (
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {(() => {
                                        // Handle both TIME format (HH:MM:SS) and TIMESTAMP format
                                        const startTime = activity.start_time.includes('T')
                                          ? activity.start_time
                                          : `2000-01-01T${activity.start_time}`;
                                        const endTime = activity.end_time.includes('T')
                                          ? activity.end_time
                                          : `2000-01-01T${activity.end_time}`;
                                        return (
                                          <>
                                            {format(new Date(startTime), 'h:mm a')} -{' '}
                                            {format(new Date(endTime), 'h:mm a')}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}
                                  {activity.start_time && !activity.end_time && (
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {(() => {
                                        const startTime = activity.start_time.includes('T')
                                          ? activity.start_time
                                          : `2000-01-01T${activity.start_time}`;
                                        return format(new Date(startTime), 'h:mm a');
                                      })()}
                                    </div>
                                  )}
                                  {activity.cost_cents !== undefined && (
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-1" />$
                                      {(activity.cost_cents / 100).toFixed(2)}{' '}
                                      {t('tripDetail.perPerson')}
                                    </div>
                                  )}
                                  {activity.source === 'ai' && (
                                    <div className="flex items-center text-purple-600 dark:text-purple-400">
                                      <Sparkles className="w-4 h-4 mr-1" />
                                      {t('tripDetail.aiSuggested')}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Voting */}
                              <div className="ml-6 flex flex-col items-center space-y-2">
                                <button
                                  onClick={() => handleVote(activity.id, 'up')}
                                  disabled={votingActivityId === activity.id || !user}
                                  aria-label={
                                    userVote === 'up'
                                      ? t('tripDetail.removeUpvote') || 'Remove upvote'
                                      : t('tripDetail.upvote') || 'Upvote this activity'
                                  }
                                  className={`p-2 rounded-lg transition ${
                                    userVote === 'up'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <ThumbsUp
                                    className={`w-5 h-5 ${
                                      votingActivityId === activity.id ? 'animate-pulse' : ''
                                    }`}
                                  />
                                </button>
                                <span
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                  aria-label={`${upvotes - downvotes} ${t('tripDetail.netVotes') || 'net votes'}`}
                                >
                                  {upvotes - downvotes > 0 ? '+' : ''}
                                  {upvotes - downvotes}
                                </span>
                                <button
                                  onClick={() => handleVote(activity.id, 'down')}
                                  disabled={votingActivityId === activity.id || !user}
                                  aria-label={
                                    userVote === 'down'
                                      ? t('tripDetail.removeDownvote') || 'Remove downvote'
                                      : t('tripDetail.downvote') || 'Downvote this activity'
                                  }
                                  className={`p-2 rounded-lg transition ${
                                    userVote === 'down'
                                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <ThumbsDown
                                    className={`w-5 h-5 ${
                                      votingActivityId === activity.id ? 'animate-pulse' : ''
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <TripChat tripId={tripId!} userRole={getUserRole()} />
        )}
      </main>

      {/* Create Activity Modal */}
      {showAddActivityModal && tripId && (
        <CreateActivityModal tripId={tripId} onClose={() => setShowAddActivityModal(false)} />
      )}
    </div>
  );
}
