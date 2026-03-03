import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';
import NearbyPlaces from '@/components/NearbyPlaces';
import { TripChat } from '@/features/chat';
import { CreateActivityModal } from '@/features/activities';
import { useStore } from '@/lib/store';
import { DashboardHeader } from '@/pages/dashboard/DashboardHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  useTripDetail,
  TripDetailHeader,
  TripDetailHero,
  TripDetailTabs,
  TripDetailItinerary,
} from './trip-detail';

export default function TripDetailPage() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const signOut = useStore((s) => s.signOut);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch {
      // ignore
    }
  };

  const {
    t,
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
    activityParticipantsMap,
    memberProfiles,
    showAddActivityModal,
    setShowAddActivityModal,
  } = useTripDetail();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center flex-1 min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{t('tripDetail.loadingTrip')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <div className="flex items-center justify-center flex-1 min-h-[60vh]">
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
      </div>
    );
  }

  if (!currentTrip) {
    return null;
  }

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
        onCancelEdit={() => {
          setIsEditing(false);
          const c = currentTrip.constraints as
            | import('@/lib/types/database.types').TripConstraints
            | null;
          setEditForm({
            title: currentTrip.title,
            destination_text: currentTrip.destination_text,
            start_date: currentTrip.start_date,
            end_date: currentTrip.end_date,
            status: currentTrip.status,
            pace: (c?.pace as 'relaxed' | 'balanced' | 'packed') || 'balanced',
            budget: c?.budget_per_person_cents
              ? String(Math.round(c.budget_per_person_cents / 100))
              : '',
            currency: currentTrip.currency || 'EUR',
            has_children: !!c?.has_children,
          });
        }}
        onSave={handleUpdateTrip}
        onDelete={() => setShowDeleteModal(true)}
        t={t}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('tripDetail.delete')}
        closeOnBackdrop={true}
        showCloseButton={true}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('tripDetail.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleDeleteTrip();
                setShowDeleteModal(false);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? t('tripDetail.deleting') : t('tripDetail.delete')}
            </Button>
          </>
        }
      >
        <p className="text-stone-600 dark:text-stone-300">{t('tripDetail.confirmDelete')}</p>
      </Modal>

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
            canEdit={canEdit()}
            canVote={!!user}
            activitiesByDate={activitiesByDate}
            sortedDates={sortedDates}
            votingActivityId={votingActivityId}
            getVoteCounts={getVoteCounts}
            getUserVote={getUserVote}
            onVote={handleVote}
            onAddActivity={() => setShowAddActivityModal(true)}
            t={t}
            totalSpentCents={Object.values(activitiesByDate)
              .flat()
              .reduce((s, a) => s + (a.cost_max_cents ?? a.cost_min_cents ?? a.cost_cents ?? 0), 0)}
            budgetCents={(() => {
              const c = currentTrip.constraints as
                | import('@/lib/types/database.types').TripConstraints
                | null;
              return (
                c?.budget_total_cents ??
                (typeof c?.budget_per_person_cents === 'number' && tripMembers.length > 0
                  ? c.budget_per_person_cents * tripMembers.length
                  : null) ??
                null
              );
            })()}
            currency={currentTrip.currency ?? 'EUR'}
            constraintsSummary={(() => {
              const c = currentTrip.constraints as
                | import('@/lib/types/database.types').TripConstraints
                | null;
              return c
                ? { pace: c.pace, has_children: c.has_children, preferences: c.preferences }
                : null;
            })()}
            membersCount={tripMembers.length}
            activityParticipantsMap={activityParticipantsMap}
            tripMembers={tripMembers}
            memberProfiles={memberProfiles}
          />
        )}
        {activeTab === 'chat' && tripId && <TripChat tripId={tripId} userRole={getUserRole()} />}
      </main>

      {showAddActivityModal && tripId && (
        <CreateActivityModal tripId={tripId} onClose={() => setShowAddActivityModal(false)} />
      )}
    </div>
  );
}
