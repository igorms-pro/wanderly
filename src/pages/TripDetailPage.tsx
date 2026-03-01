import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import WeatherWidget from '@/components/WeatherWidget';
import NearbyPlaces from '@/components/NearbyPlaces';
import { TripChat } from '@/features/chat';
import { CreateActivityModal } from '@/features/activities';
import {
  useTripDetail,
  TripDetailHeader,
  TripDetailHero,
  TripDetailTabs,
  TripDetailItinerary,
} from './trip-detail';

export default function TripDetailPage() {
  const {
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
  } = useTripDetail();

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
      <TripDetailHeader />

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
          setEditForm({
            title: currentTrip.title,
            destination_text: currentTrip.destination_text,
            start_date: currentTrip.start_date,
            end_date: currentTrip.end_date,
            status: currentTrip.status,
          });
        }}
        onSave={handleUpdateTrip}
        onDelete={handleDeleteTrip}
        t={t}
      />

      <TripDetailTabs activeTab={activeTab} onTabChange={setActiveTab} t={t} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
