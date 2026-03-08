import { useNavigate } from 'react-router-dom';
import WeatherWidget from '@/components/WeatherWidget';
import NearbyPlaces from '@/components/NearbyPlaces';
import { TripChat } from '@/features/chat';
import {
  ActivityDeleteConfirmModal,
  CreateActivityModal,
  EditActivityModal,
} from '@/features/activities';
import { useStore } from '@/lib/store';
import { DashboardHeader } from '@/pages/dashboard/DashboardHeader';
import {
  useTripDetail,
  TripDetailHeader,
  TripDetailHero,
  TripDetailTabs,
  TripDetailItinerary,
  TripDetailLoadingState,
  TripDetailErrorState,
  TripDetailDeleteModal,
} from './trip-detail';
import {
  getTripBudgetFromConstraints,
  getConstraintsSummary,
} from './trip-detail/utils/tripDetailPageHelpers';
import { useTripDetailPageModals } from './trip-detail/hooks/useTripDetailPageModals';
import type { TripConstraints } from '@/lib/types/database.types';

export default function TripDetailPage() {
  const navigate = useNavigate();
  const signOut = useStore((s) => s.signOut);
  const deleteActivity = useStore((s) => s.deleteActivity);

  const {
    t,
    user,
    tripId,
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
    itineraryDayIdByDate,
    activityParticipantsMap,
    memberProfiles,
    refreshActivityParticipants,
    showAddActivityModal,
    setShowAddActivityModal,
    scenarios,
    scenariosLoading: _scenariosLoading,
    scenariosError: _scenariosError,
    canCreateActivitiesAndScenarios,
    canManageScenarios,
    canEditActivities,
    canReorderActivities,
    createScenario,
    deleteScenario,
    generateAiScenario,
    applyScenarioAsBase,
    importScenarioActivityToItinerary,
  } = useTripDetail();

  const {
    showDeleteModal,
    setShowDeleteModal,
    activityToEdit,
    setActivityToEdit,
    activityToDelete,
    setActivityToDelete,
    lastEditedActivityId,
    handleAddMeToActivity,
    handleRemoveMeFromActivity,
    handleEditActivitySaveSuccess,
  } = useTripDetailPageModals({
    tripId,
    user,
    tripMembers,
    activityParticipantsMap,
    refreshActivityParticipants,
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <TripDetailLoadingState
        headerProps={{ user, onLogout: handleLogout }}
        message={t('tripDetail.loadingTrip')}
      />
    );
  }

  if (error) {
    return (
      <TripDetailErrorState
        headerProps={{ user, onLogout: handleLogout }}
        title={t('tripDetail.errorLoadingTrip')}
        errorMessage={error}
        backLabel={t('tripDetail.backToDashboard')}
        retryLabel={t('trip.tryAgain')}
        onBack={() => navigate('/dashboard')}
        onRetry={loadTripData}
      />
    );
  }

  if (!currentTrip) {
    return null;
  }

  const handleCancelEdit = () => {
    setIsEditing(false);
    const c = currentTrip.constraints as TripConstraints | null;
    setEditForm({
      title: currentTrip.title,
      destination_text: currentTrip.destination_text,
      start_date: currentTrip.start_date,
      end_date: currentTrip.end_date,
      status: currentTrip.status,
      pace: (c?.pace as 'relaxed' | 'balanced' | 'packed') || 'balanced',
      budget: c?.budget_per_person_cents ? String(Math.round(c.budget_per_person_cents / 100)) : '',
      currency: currentTrip.currency || 'EUR',
      has_children: !!c?.has_children,
    });
  };

  const totalSpentCents = Object.values(activitiesByDate)
    .flat()
    .reduce((s, a) => s + (a.cost_max_cents ?? a.cost_min_cents ?? a.cost_cents ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} onLogout={handleLogout} />
      <div className="sticky top-14 sm:top-16 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TripDetailHeader />
      </div>

      <TripDetailHero
        currentTrip={currentTrip}
        tripMembers={tripMembers}
        isEditing={isEditing}
        editForm={editForm}
        setEditForm={setEditForm}
        isDeleting={isDeleting}
        canEdit={canEdit}
        canDelete={canDelete}
        onStartEdit={() => setIsEditing(true)}
        onCancelEdit={handleCancelEdit}
        onSave={handleUpdateTrip}
        onDelete={() => setShowDeleteModal(true)}
        t={t}
      />

      <TripDetailDeleteModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await handleDeleteTrip();
          setShowDeleteModal(false);
        }}
        t={t}
      />

      <TripDetailTabs activeTab={activeTab} onTabChange={setActiveTab} t={t} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {activeTab === 'weather' && (
          <WeatherWidget
            destination={currentTrip.destination_text}
            startDate={currentTrip.start_date}
            endDate={currentTrip.end_date}
          />
        )}
        {activeTab === 'explore' && <NearbyPlaces destination={currentTrip.destination_text} />}
        {activeTab === 'itinerary' && (
          <TripDetailItinerary
            startDate={currentTrip.start_date}
            endDate={currentTrip.end_date}
            canEdit={canEditActivities()}
            canReorder={canReorderActivities()}
            canVote={!!user}
            lastEditedActivityId={lastEditedActivityId}
            activitiesByDate={activitiesByDate}
            sortedDates={sortedDates}
            itineraryDayIdByDate={itineraryDayIdByDate}
            votingActivityId={votingActivityId}
            getVoteCounts={getVoteCounts}
            getUserVote={getUserVote}
            onVote={handleVote}
            onAddActivity={() => setShowAddActivityModal(true)}
            t={t}
            totalSpentCents={totalSpentCents}
            budgetCents={getTripBudgetFromConstraints(currentTrip, tripMembers.length)}
            currency={currentTrip.currency ?? 'EUR'}
            constraintsSummary={getConstraintsSummary(currentTrip)}
            membersCount={tripMembers.length}
            activityParticipantsMap={activityParticipantsMap}
            tripMembers={tripMembers}
            memberProfiles={memberProfiles}
            scenarios={scenarios}
            canCreateScenarios={canCreateActivitiesAndScenarios()}
            canManageScenarios={canManageScenarios()}
            onGenerateAiScenario={async () => {
              await generateAiScenario(currentTrip, tripMembers.length);
            }}
            onCreateScenario={createScenario}
            onDeleteScenario={deleteScenario}
            onUseScenarioAsBase={async (scenarioId) => {
              if (!tripId) return;
              await applyScenarioAsBase(tripId, scenarioId);
            }}
            onAddScenarioActivityToItinerary={async (date, activity) => {
              if (!tripId) return;
              await importScenarioActivityToItinerary(tripId, date, activity);
            }}
            onEditActivity={(activity, date) => {
              if (!date) return;
              setActivityToEdit({ activity, date });
            }}
            onDeleteActivity={(activity) => {
              setActivityToDelete(activity);
            }}
          />
        )}
        {activeTab === 'chat' && tripId && <TripChat tripId={tripId} userRole={getUserRole()} />}
      </main>

      {showAddActivityModal && tripId && (
        <CreateActivityModal tripId={tripId} onClose={() => setShowAddActivityModal(false)} />
      )}

      {activityToEdit && tripId && (
        <EditActivityModal
          tripId={tripId}
          activity={activityToEdit.activity}
          date={activityToEdit.date}
          onClose={() => setActivityToEdit(null)}
          onSaveSuccess={handleEditActivitySaveSuccess}
          currentUserId={user?.id ?? null}
          activityParticipantsMap={activityParticipantsMap}
          tripMembers={tripMembers}
          memberProfiles={memberProfiles}
          onAddMe={handleAddMeToActivity}
          onRemoveMe={handleRemoveMeFromActivity}
        />
      )}

      <ActivityDeleteConfirmModal
        activity={activityToDelete}
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={async (activityId) => {
          await deleteActivity(activityId);
          setActivityToDelete(null);
        }}
      />
    </div>
  );
}
