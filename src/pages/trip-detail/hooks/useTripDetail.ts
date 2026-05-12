import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { useToast } from '@/contexts/ToastContext';
import { TripMember } from '@/lib/types/database.types';
import { useTripDetailRealtime } from './useTripDetailRealtime';
import { loadTripDataForDetail, fetchActivityParticipants } from './loadTripDataForDetail';
import { updateTripHandler, deleteTripHandler } from './tripDetailHandlers';
import type { EditFormState } from '../components/layout/TripDetailHero';
import { useTripScenarios } from './useTripScenarios';
import { useTripDetailPermissions } from './useTripDetailPermissions';
import { useTripDetailActivities } from './useTripDetailActivities';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(() => ({
    title: '',
    destination_text: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    pace: 'balanced',
    budget: '',
    currency: 'EUR',
    has_children: false,
  }));
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

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
      setEditForm,
      setTripMembers,
      setActivityParticipantsMap,
      setMemberProfiles,
      setActiveTabState,
      navigate,
      t,
      getState: useStore.getState,
    });
  }, [tripId, user, navigate, setCurrentTrip, t, setActiveTabState]);

  const refreshActivityParticipants = useCallback(async () => {
    const activityIds = useStore.getState().activities.map((a) => a.id);
    await fetchActivityParticipants(activityIds, setActivityParticipantsMap);
  }, []);

  const handleUpdateTrip = useCallback(async () => {
    await updateTripHandler({
      tripId,
      currentTrip,
      editForm,
      addToast,
      t,
      updateTrip,
      setIsEditing,
      loadTripData,
    });
  }, [tripId, currentTrip, editForm, addToast, t, updateTrip, loadTripData]);

  const handleDeleteTrip = useCallback(async () => {
    await deleteTripHandler({
      tripId,
      currentTrip,
      addToast,
      t,
      deleteTrip,
      navigate,
      setIsDeleting,
    });
  }, [tripId, currentTrip, addToast, t, deleteTrip, navigate]);

  const handleFinalizeItinerary = useCallback(async (): Promise<void> => {
    if (!tripId || !currentTrip || currentTrip.status !== 'planned') return;
    try {
      setIsFinalizing(true);
      await updateTrip(tripId, { status: 'locked' });
      addToast({ variant: 'success', message: t('tripDetail.finalizeSuccess') });
      await loadTripData();
    } catch {
      addToast({ variant: 'error', message: t('tripDetail.finalizeError') });
    } finally {
      setIsFinalizing(false);
    }
  }, [tripId, currentTrip, updateTrip, addToast, t, loadTripData]);

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
    isEditing,
    setIsEditing,
    editForm,
    setEditForm,
    isDeleting,
    activityParticipantsMap,
    memberProfiles,
    loadTripData,
    refreshActivityParticipants,
    handleUpdateTrip,
    handleDeleteTrip,
    handleFinalizeItinerary,
    isFinalizing,
    activeTab,
    setActiveTab,
    showAddActivityModal,
    setShowAddActivityModal,
  };
}

export function useTripDetail() {
  const data = useTripDetailData();
  const activities = useTripDetailActivities(data.t);
  const permissions = useTripDetailPermissions({
    user: data.user,
    tripMembers: data.tripMembers,
    currentTrip: data.currentTrip,
  });
  const scenariosState = useTripScenarios(data.tripId);
  const generateAiScenario = useStore((s) => s.generateAiScenario);
  const applyScenarioAsBase = useStore((s) => s.applyScenarioAsBase);
  const importScenarioActivityToItinerary = useStore((s) => s.importScenarioActivityToItinerary);

  useEffect(() => {
    scenariosState.load();
  }, [scenariosState, scenariosState.load]);

  const scenarios = data.currentTrip?.active_itinerary_id
    ? scenariosState.scenarios.filter((s) => s.id !== data.currentTrip?.active_itinerary_id)
    : scenariosState.scenarios;

  return {
    ...data,
    ...activities,
    ...permissions,
    scenarios,
    scenariosLoading: scenariosState.loading,
    scenariosError: scenariosState.error,
    createScenario: scenariosState.create,
    deleteScenario: scenariosState.remove,
    generateAiScenario,
    applyScenarioAsBase,
    importScenarioActivityToItinerary,
  };
}
