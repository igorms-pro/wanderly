import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import type { Activity, Vote } from '@/lib/types/database.types';
import { TripMember } from '@/lib/types/database.types';
import { useTripDetailRealtime } from './useTripDetailRealtime';
import { loadTripDataForDetail } from './loadTripDataForDetail';
import { updateTripHandler, deleteTripHandler } from './tripDetailHandlers';

export function useTripDetail() {
  const { t } = useTranslation();
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTabState] = useState<'itinerary' | 'chat' | 'weather' | 'explore'>(
    'itinerary',
  );
  const setActiveTab = useCallback(
    (tab: 'itinerary' | 'chat' | 'weather' | 'explore') => {
      setActiveTabState(tab);
      if (tripId) {
        try {
          sessionStorage.setItem(`tripDetail:tab:${tripId}`, tab);
        } catch {
          /* ignore */
        }
      }
    },
    [tripId],
  );
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    destination_text: '',
    start_date: '',
    end_date: '',
    status: 'planned' as 'planned' | 'locked' | 'archived',
    pace: 'balanced' as 'relaxed' | 'balanced' | 'packed',
    budget: '',
    currency: 'EUR',
    has_children: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [votingActivityId, setVotingActivityId] = useState<string | null>(null);

  useTripDetailRealtime(tripId ?? undefined);
  const { addToast } = useToast();
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

  const activitiesByDate = useMemo(
    () =>
      activities.reduce(
        (acc, activity) => {
          const date = activity.start_time?.includes('T')
            ? activity.start_time.split('T')[0]
            : activity.created_at.split('T')[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(activity);
          return acc;
        },
        {} as Record<string, Activity[]>,
      ),
    [activities],
  );
  const sortedDates = useMemo(() => Object.keys(activitiesByDate).sort(), [activitiesByDate]);

  const getUserVote = useCallback(
    (activityId: string): 'up' | 'down' | null => {
      if (!user) return null;
      const activityVotes = votes[activityId] || [];
      const userVote = activityVotes.find((v) => v.user_id === user.id);
      return userVote ? userVote.choice : null;
    },
    [user, votes],
  );

  const getVoteCounts = useCallback(
    (activityId: string) => {
      const activityVotes = votes[activityId] || [];
      const upvotes = activityVotes.filter((v) => v.choice === 'up').length;
      const downvotes = activityVotes.filter((v) => v.choice === 'down').length;
      return { upvotes, downvotes };
    },
    [votes],
  );

  const handleVote = useCallback(
    async (activityId: string, choice: 'up' | 'down') => {
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
    },
    [user, votes, setVotes, createOrUpdateVote, t, getUserVote],
  );

  const loadTripData = useCallback(async () => {
    if (!tripId || !user) return;
    await loadTripDataForDetail({
      tripId,
      setLoading,
      setError,
      setCurrentTrip,
      setEditForm,
      setTripMembers,
      setActiveTabState,
      navigate,
      t,
      getState: useStore.getState,
    });
  }, [tripId, user, navigate, setCurrentTrip, t]);

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

  const handleUpdateTrip = useCallback(
    () =>
      updateTripHandler({
        tripId,
        currentTrip,
        editForm,
        addToast,
        t,
        updateTrip,
        setIsEditing,
        loadTripData,
      }),
    [tripId, currentTrip, editForm, addToast, t, updateTrip, setIsEditing, loadTripData],
  );

  const handleDeleteTrip = useCallback(
    () =>
      deleteTripHandler({
        tripId,
        currentTrip,
        addToast,
        t,
        deleteTrip,
        navigate,
        setIsDeleting,
      }),
    [tripId, currentTrip, addToast, t, deleteTrip, navigate, setIsDeleting],
  );

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
