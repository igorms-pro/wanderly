import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import type { Activity, Vote } from '@/lib/types/database.types';
import { TripMember } from '@/lib/types/database.types';
import { useTripDetailRealtime } from './useTripDetailRealtime';
import { groupActivitiesByDate } from './itinerary-utils';
import { loadTripDataForDetail } from './loadTripDataForDetail';
import { updateTripHandler, deleteTripHandler } from './tripDetailHandlers';

type TripDetailTab = 'itinerary' | 'chat' | 'weather' | 'explore';

function useTripDetailUiState(tripId: string | undefined) {
  const [activeTab, setActiveTabState] = useState<TripDetailTab>('itinerary');

  const setActiveTab = useCallback(
    (tab: TripDetailTab) => {
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

  return { activeTab, setActiveTab, setActiveTabState };
}

function useTripDetailData() {
  const { t } = useTranslation();
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [activityParticipantsMap, setActivityParticipantsMap] = useState<Record<string, string[]>>(
    {},
  );
  const [memberProfiles, setMemberProfiles] = useState<
    Record<string, { display_name: string | null; avatar_url: string | null; email: string | null }>
  >({});

  useTripDetailRealtime(tripId ?? undefined);
  const { addToast } = useToast();
  const user = useStore((state) => state.user);
  const currentTrip = useStore((state) => state.currentTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);
  const updateTrip = useStore((state) => state.updateTrip);
  const deleteTrip = useStore((state) => state.deleteTrip);
  const showAddActivityModal = useStore((state) => state.showAddActivityModal);
  const setShowAddActivityModal = useStore((state) => state.setShowAddActivityModal);

  const { activeTab, setActiveTab, setActiveTabState } = useTripDetailUiState(tripId);

  const loadTripData = useCallback(async () => {
    if (!tripId || !user) return;
    await loadTripDataForDetail({
      tripId,
      setLoading,
      setError,
      setCurrentTrip,
      setTripMembers,
      setActivityParticipantsMap,
      setMemberProfiles,
      setActiveTabState,
      navigate,
      t,
      getState: useStore.getState,
    });
  }, [tripId, user, navigate, setCurrentTrip, t, setActiveTabState]);

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

  return {
    t,
    user,
    tripId,
    navigate,
    loading,
    error,
    currentTrip,
    tripMembers,
    activityParticipantsMap,
    memberProfiles,
    loadTripData,
    activeTab,
    setActiveTab,
    showAddActivityModal,
    setShowAddActivityModal,
  };
}

function useTripDetailPermissions(
  user: { id: string } | null,
  tripMembers: TripMember[],
  currentTrip: { owner_id: string } | null,
) {
  const getUserRole = useCallback((): 'owner' | 'editor' | 'viewer' | 'moderator' | null => {
    if (!user) return null;
    const member = tripMembers.find((m) => m.user_id === user.id);
    return member?.role || null;
  }, [tripMembers, user]);

  const canEdit = useCallback((): boolean => {
    if (!user || !currentTrip) return false;
    const role = getUserRole();
    return role === 'owner' || role === 'editor' || user.id === currentTrip.owner_id;
  }, [currentTrip, getUserRole, user]);

  const canDelete = useCallback((): boolean => {
    if (!user || !currentTrip) return false;
    return user.id === currentTrip.owner_id;
  }, [currentTrip, user]);

  return {
    getUserRole,
    canEdit,
    canDelete,
  };
}

function useTripDetailDerivedState(activities: Activity[]) {
  const activitiesByDate = useMemo(() => groupActivitiesByDate(activities), [activities]);

  const sortedDates = useMemo(() => Object.keys(activitiesByDate).sort(), [activitiesByDate]);

  return {
    activitiesByDate,
    sortedDates,
  };
}

function useTripDetailActions(
  t: (key: string) => string,
  user: { id: string } | null,
  votes: Record<string, Vote[]>,
  setVotes: (nextVotes: Record<string, Vote[]>) => void,
  createOrUpdateVote: (activityId: string, choice: 'up' | 'down') => Promise<void>,
) {
  const [votingActivityId, setVotingActivityId] = useState<string | null>(null);

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
    [createOrUpdateVote, getUserVote, t, user, votes, setVotes],
  );

  return {
    votingActivityId,
    handleVote,
    getVoteCounts,
    getUserVote,
  };
}

function useTripDetailActivities(t: (key: string) => string) {
  const user = useStore((state) => state.user);
  const activities = useStore((state) => state.activities);
  const votes = useStore((state) => state.votes);
  const setVotes = useStore((state) => state.setVotes);
  const createOrUpdateVote = useStore((state) => state.createOrUpdateVote);

  const derivedState = useTripDetailDerivedState(activities);
  const actions = useTripDetailActions(t, user, votes, setVotes, createOrUpdateVote);

  return {
    ...derivedState,
    ...actions,
  };
}

export function useTripDetail() {
  const data = useTripDetailData();
  const activities = useTripDetailActivities(data.t);
  const permissions = useTripDetailPermissions(data.user, data.tripMembers, data.currentTrip);

  return {
    ...data,
    ...activities,
    ...permissions,
  };
}
