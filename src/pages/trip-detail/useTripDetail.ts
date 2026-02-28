import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Activity, Vote, Trip } from '@/lib/mock-supabase';
import { TripMember } from '@/lib/types/database.types';
import {
  subscribeToTrip,
  subscribeToMessages,
  subscribeToActivities,
  subscribeToVotes,
  RealtimePayload,
  unsubscribeFromChannel,
} from '@/lib/realtime-service';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useTripDetail() {
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

      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .is('removed_at', null);
      if (membersError) console.error('Error loading trip members:', membersError);
      else setTripMembers(members || []);

      await loadActivities(tripId);
      const { activities: currentActivities } = useStore.getState();
      if (currentActivities.length > 0) {
        await loadVotes(currentActivities.map((a) => a.id));
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

  useEffect(() => {
    if (!tripId || !user) return;

    tripSubscriptionRef.current = subscribeToTrip(tripId, (payload: RealtimePayload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
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
        navigate('/dashboard');
      }
    });

    messagesSubscriptionRef.current = subscribeToMessages(tripId, (_payload: RealtimePayload) => {
      // Message updates can be handled by TripChat
    });

    activitiesSubscriptionRef.current = subscribeToActivities(
      tripId,
      (payload: RealtimePayload) => {
        try {
          if (payload.eventType === 'INSERT' && payload.new) {
            const activity = payload.new as any;
            if (activity.trip_id !== tripId) return;
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
            addActivity(mappedActivity);
            loadVotes([mappedActivity.id]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const activity = payload.new as any;
            if (activity.trip_id !== tripId) return;
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
            updateActivityInState(activity.id, updates);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const activityId = payload.old?.id;
            if (!activityId) return;
            const { activities: currentActivities } = useStore.getState();
            setActivities(currentActivities.filter((a) => a.id !== activityId));
            const { votes: currentVotes } = useStore.getState();
            const updatedVotes = { ...currentVotes };
            delete updatedVotes[activityId];
            setVotes(updatedVotes);
          }
        } catch (e) {
          console.error('Error handling activities real-time event:', e);
        }
      },
    );

    votesSubscriptionRef.current = subscribeToVotes(tripId, (payload: RealtimePayload) => {
      try {
        if (payload.eventType === 'INSERT' && payload.new) {
          const vote = payload.new as any;
          const { activities: currentActivities } = useStore.getState();
          const activity = currentActivities.find((a) => a.id === vote.activity_id);
          if (!activity || activity.trip_id !== tripId) return;
          const mappedVote: Vote = {
            id: vote.id,
            activity_id: vote.activity_id,
            user_id: vote.user_id,
            choice: vote.choice,
            created_at: vote.created_at,
          };
          const { votes: currentVotes } = useStore.getState();
          const activityVotes = currentVotes[vote.activity_id] || [];
          if (!activityVotes.find((v) => v.id === vote.id)) {
            setVotes({ ...currentVotes, [vote.activity_id]: [...activityVotes, mappedVote] });
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const vote = payload.new as any;
          const { activities: currentActivities } = useStore.getState();
          const activity = currentActivities.find((a) => a.id === vote.activity_id);
          if (!activity || activity.trip_id !== tripId) return;
          const mappedVote: Vote = {
            id: vote.id,
            activity_id: vote.activity_id,
            user_id: vote.user_id,
            choice: vote.choice,
            created_at: vote.created_at,
          };
          const { votes: currentVotes } = useStore.getState();
          const activityVotes = currentVotes[vote.activity_id] || [];
          setVotes({
            ...currentVotes,
            [vote.activity_id]: activityVotes.map((v) => (v.id === vote.id ? mappedVote : v)),
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          const vote = payload.old as any;
          if (!vote?.activity_id) return;
          const { activities: currentActivities } = useStore.getState();
          const activity = currentActivities.find((a) => a.id === vote.activity_id);
          if (!activity || activity.trip_id !== tripId) return;
          const { votes: currentVotes } = useStore.getState();
          const activityVotes = currentVotes[vote.activity_id] || [];
          setVotes({
            ...currentVotes,
            [vote.activity_id]: activityVotes.filter((v) => v.id !== vote.id),
          });
        }
      } catch (e) {
        console.error('Error handling votes real-time event:', e);
      }
    });

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
      await loadTripData();
    } catch (err: any) {
      console.error('Error updating trip:', err);
      alert(err.message || t('errors.failedToUpdateTrip'));
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripId || !currentTrip) return;
    if (!confirm(t('tripDetail.confirmDelete'))) return;
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

  const getUserVote = (activityId: string): 'up' | 'down' | null => {
    if (!user) return null;
    const activityVotes = votes[activityId] || [];
    const userVote = activityVotes.find((v) => v.user_id === user.id);
    return userVote ? userVote.choice : null;
  };

  const handleVote = async (activityId: string, choice: 'up' | 'down') => {
    if (!user) {
      alert(t('errors.mustBeLoggedIn') || 'You must be logged in to vote');
      return;
    }
    setVotingActivityId(activityId);
    const currentVote = getUserVote(activityId);
    const isRemovingVote = currentVote === choice;
    const originalVotes = { ...votes };
    const activityVotes = votes[activityId] || [];

    try {
      if (isRemovingVote) {
        const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
        setVotes({ ...votes, [activityId]: filteredVotes });
        const userVote = activityVotes.find((v) => v.user_id === user.id);
        if (userVote) {
          const { error } = await supabase.from('votes').delete().eq('id', userVote.id);
          if (error) throw error;
        }
      } else {
        const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
        const optimisticVote: Vote = {
          id: `temp-${Date.now()}`,
          activity_id: activityId,
          user_id: user.id,
          choice,
          created_at: new Date().toISOString(),
        };
        setVotes({ ...votes, [activityId]: [...filteredVotes, optimisticVote] });
        await createOrUpdateVote(activityId, choice);
      }
    } catch (err: any) {
      console.error('Error voting:', err);
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

  const activitiesByDate = useMemo(
    () =>
      activities.reduce(
        (acc, activity) => {
          let date: string;
          if (activity.start_time && activity.start_time.includes('T')) {
            date = activity.start_time.split('T')[0];
          } else {
            date = activity.created_at.split('T')[0];
          }
          if (!acc[date]) acc[date] = [];
          acc[date].push(activity);
          return acc;
        },
        {} as Record<string, Activity[]>,
      ),
    [activities],
  );

  const sortedDates = useMemo(() => Object.keys(activitiesByDate).sort(), [activitiesByDate]);

  return {
    t,
    user,
    tripId,
    navigate,
    loading,
    error,
    currentTrip,
    tripMembers,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    editForm,
    setEditForm,
    isDeleting,
    votingActivityId,
    loadTripData,
    handleUpdateTrip,
    handleDeleteTrip,
    getUserRole,
    canEdit,
    canDelete,
    handleVote,
    getVoteCounts,
    getUserVote,
    activitiesByDate,
    sortedDates,
    showAddActivityModal,
    setShowAddActivityModal,
  };
}
