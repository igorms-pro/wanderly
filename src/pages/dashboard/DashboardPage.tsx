import { useNavigate } from 'react-router-dom';
import { CreateTripModal, DashboardHero } from '@/features/trips';
import { TemplatePickerModal } from '@/features/trip-sharing';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSearchFilters } from './DashboardSearchFilters';
import { DashboardLoadingState } from './DashboardLoadingState';
import { DashboardErrorState } from './DashboardErrorState';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardTripSections } from './DashboardTripSections';
import { DashboardStatsSummary } from './DashboardStatsSummary';
import { useDashboardPage } from './useDashboardPage';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    trips,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    tripMemberCounts,
    openMenuId,
    setOpenMenuId,
    showCreateTripModal,
    setShowCreateTripModal,
    showTemplatePicker,
    setShowTemplatePicker,
    filteredAndSortedTrips,
    loadTripsData,
    handleLogout,
    handleDeleteTrip,
    handleArchiveTrip,
  } = useDashboardPage();

  if (loading) return <DashboardLoadingState />;
  if (error) return <DashboardErrorState message={error} onRetry={loadTripsData} />;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          <DashboardHero
            user={user}
            onCreateTrip={() => setShowCreateTripModal(true)}
            onUseTemplate={() => setShowTemplatePicker(true)}
          />
        ) : null}
        <DashboardStatsSummary trips={trips} />

        <DashboardSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {filteredAndSortedTrips.length === 0 ? (
          <DashboardEmptyState
            hasTrips={trips.length > 0}
            onCreateTrip={() => setShowCreateTripModal(true)}
          />
        ) : (
          <DashboardTripSections
            trips={trips}
            filteredTrips={filteredAndSortedTrips}
            memberCounts={tripMemberCounts}
            openMenuId={openMenuId}
            onToggleMenu={(tripId) => setOpenMenuId(openMenuId === tripId ? null : tripId)}
            onOpenTrip={(tripId) => navigate(`/trip/${tripId}`)}
            onArchiveTrip={handleArchiveTrip}
            onDeleteTrip={handleDeleteTrip}
          />
        )}
      </main>

      {showCreateTripModal ? (
        <CreateTripModal onClose={() => setShowCreateTripModal(false)} />
      ) : null}
      {showTemplatePicker && user ? (
        <TemplatePickerModal
          userId={user.id}
          onClose={() => setShowTemplatePicker(false)}
          onCreated={(tripId) => {
            setShowTemplatePicker(false);
            void loadTripsData();
            navigate(`/trip/${tripId}`);
          }}
        />
      ) : null}
    </div>
  );
}
