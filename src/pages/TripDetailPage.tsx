import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import WeatherWidget from '@/components/WeatherWidget';
import { TripExploreTab } from '@/pages/trip-detail/components/explore/TripExploreTab';
import { TripChat } from '@/features/chat';
import { maxAiScenariosForTier } from '@/lib/ai/aiScenarioLimits';
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
  TripDetailFinalizeModal,
} from './trip-detail';
import { TripDetailPageActivityModals } from './trip-detail/components/TripDetailPageActivityModals';
import { useTripDetailChatUnreadCount } from './trip-detail/hooks/useTripDetailChatUnreadCount';
import { useTripDetailPageHandlers } from './trip-detail/hooks/useTripDetailPageHandlers';
import { useTripDetailPageModals } from './trip-detail/hooks/useTripDetailPageModals';
import {
  buildEditFormFromTrip,
  getTripBudgetFromConstraints,
  getConstraintsSummary,
  sumActivityCostsCents,
} from './trip-detail/utils/tripDetailPageHelpers';

export default function TripDetailPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const signOut = useStore((s) => s.signOut);
  const deleteActivity = useStore((s) => s.deleteActivity);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      // ignore
    }
  };

  const tripDetail = useTripDetail();
  const {
    t,
    locale,
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
    loadTripData,
    handleUpdateTrip,
    handleDeleteTrip,
    getUserRole,
    canEdit,
    canDelete,
    showAddActivityModal,
    setShowAddActivityModal,
    userAiTier,
    canEditActivities,
    canReorderActivities,
    canCreateActivitiesAndScenarios,
    canManageScenarios,
    canFinalizeItinerary,
    handleFinalizeItinerary,
    isFinalizing,
    generateAiScenario,
    applyScenarioAsBase,
    importScenarioActivityToItinerary,
    activityParticipantsMap,
    refreshActivityParticipants,
    activitiesByDate,
    sortedDates,
  } = tripDetail;

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

  const pageHandlers = useTripDetailPageHandlers({
    tripId,
    currentTrip,
    tripMembersCount: tripMembers.length,
    locale,
    t,
    addToast,
    generateAiScenario,
    applyScenarioAsBase,
    importScenarioActivityToItinerary,
    setActivityToEdit,
    setActivityToDelete,
  });

  const chatUnreadCount = useTripDetailChatUnreadCount(tripId, user?.id, activeTab);

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

  const maxAiScenariosPerTrip = maxAiScenariosForTier(userAiTier);

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
        showFinalizeButton={canFinalizeItinerary()}
        onFinalizeClick={() => setShowFinalizeModal(true)}
        onStartEdit={() => setIsEditing(true)}
        onCancelEdit={() => {
          setIsEditing(false);
          setEditForm(buildEditFormFromTrip(currentTrip));
        }}
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

      <TripDetailFinalizeModal
        isOpen={showFinalizeModal}
        isFinalizing={isFinalizing}
        onClose={() => setShowFinalizeModal(false)}
        onConfirm={async () => {
          await handleFinalizeItinerary();
          setShowFinalizeModal(false);
        }}
        t={t}
      />

      <TripDetailTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        t={t}
        chatUnreadCount={chatUnreadCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {activeTab === 'weather' && (
          <WeatherWidget
            destination={currentTrip.destination_text}
            startDate={currentTrip.start_date}
            endDate={currentTrip.end_date}
          />
        )}
        {activeTab === 'explore' && (
          <TripExploreTab
            destination={currentTrip.destination_text}
            sortedDates={sortedDates}
            activitiesByDate={activitiesByDate}
            locale={locale}
            t={t}
            canAddToItinerary={canEditActivities()}
            onImportPlace={pageHandlers.handleImportPlace}
          />
        )}
        {activeTab === 'itinerary' && (
          <TripDetailItinerary
            startDate={currentTrip.start_date}
            endDate={currentTrip.end_date}
            canEdit={canEditActivities()}
            canReorder={canReorderActivities()}
            canVote={!!user}
            canVoteScenario={!!user}
            votingScenarioId={tripDetail.votingScenarioId}
            winningScenarioIds={tripDetail.winningScenarioIds}
            getScenarioVoteCounts={tripDetail.getScenarioVoteCounts}
            getUserScenarioVote={tripDetail.getUserScenarioVote}
            onScenarioVote={tripDetail.handleScenarioVote}
            lastEditedActivityId={lastEditedActivityId}
            activitiesByDate={activitiesByDate}
            sortedDates={sortedDates}
            itineraryDayIdByDate={tripDetail.itineraryDayIdByDate}
            votingActivityId={tripDetail.votingActivityId}
            getVoteCounts={tripDetail.getVoteCounts}
            getUserVote={tripDetail.getUserVote}
            onVote={tripDetail.handleVote}
            onAddActivity={() => setShowAddActivityModal(true)}
            t={t}
            totalSpentCents={sumActivityCostsCents(activitiesByDate)}
            budgetCents={getTripBudgetFromConstraints(currentTrip, tripMembers.length)}
            currency={currentTrip.currency ?? 'EUR'}
            constraintsSummary={getConstraintsSummary(currentTrip)}
            membersCount={tripMembers.length}
            activityParticipantsMap={activityParticipantsMap}
            tripMembers={tripMembers}
            memberProfiles={tripDetail.memberProfiles}
            scenarios={tripDetail.scenarios}
            canCreateScenarios={canCreateActivitiesAndScenarios()}
            canGenerateAiScenario={canManageScenarios()}
            maxAiScenariosPerTrip={maxAiScenariosPerTrip}
            canManageScenarios={canManageScenarios()}
            onGenerateAiScenario={pageHandlers.handleGenerateAiScenario}
            onCreateScenario={tripDetail.createScenario}
            onDeleteScenario={tripDetail.deleteScenario}
            onUseScenarioAsBase={pageHandlers.handleUseScenarioAsBase}
            onAddScenarioActivityToItinerary={pageHandlers.handleAddScenarioActivityToItinerary}
            onEditActivity={pageHandlers.handleEditActivity}
            onDeleteActivity={pageHandlers.handleDeleteActivity}
          />
        )}
        {activeTab === 'chat' && tripId && (
          <TripChat
            tripId={tripId}
            userRole={getUserRole()}
            tripMembers={tripMembers}
            memberProfiles={tripDetail.memberProfiles}
          />
        )}
      </main>

      <TripDetailPageActivityModals
        tripId={tripId}
        userId={user?.id}
        showAddActivityModal={showAddActivityModal}
        onCloseAddActivity={() => setShowAddActivityModal(false)}
        activityToEdit={activityToEdit}
        onCloseEditActivity={() => setActivityToEdit(null)}
        onEditSaveSuccess={handleEditActivitySaveSuccess}
        activityToDelete={activityToDelete}
        onCloseDeleteActivity={() => setActivityToDelete(null)}
        onConfirmDeleteActivity={async (activityId) => {
          await deleteActivity(activityId);
          setActivityToDelete(null);
        }}
        activityParticipantsMap={activityParticipantsMap}
        tripMembers={tripMembers}
        memberProfiles={tripDetail.memberProfiles}
        onAddMe={handleAddMeToActivity}
        onRemoveMe={handleRemoveMeFromActivity}
      />
    </div>
  );
}
