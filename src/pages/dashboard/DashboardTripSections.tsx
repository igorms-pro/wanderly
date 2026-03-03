import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Trip } from '@/lib/types/database.types';
import { TripCard } from '@/features/trips';

export interface DashboardTripSectionsProps {
  trips: Trip[];
  filteredTrips: Trip[];
  memberCounts: Record<string, number>;
  openMenuId: string | null;
  onToggleMenu: (tripId: string) => void;
  onOpenTrip: (tripId: string) => void;
  onArchiveTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
}

export function DashboardTripSections({
  trips,
  filteredTrips,
  memberCounts,
  openMenuId,
  onToggleMenu,
  onOpenTrip,
  onArchiveTrip,
  onDeleteTrip,
}: DashboardTripSectionsProps) {
  const { t } = useTranslation();

  const hasTrips = trips.length > 0;
  const isEmpty = filteredTrips.length === 0;

  const gridTrips = useMemo(() => filteredTrips, [filteredTrips]);

  if (!hasTrips && isEmpty) {
    return (
      <p className="mt-8 text-center text-stone-500 dark:text-stone-400">
        {t('dashboard.noTripsYet')}
      </p>
    );
  }

  if (isEmpty) {
    return (
      <p className="mt-8 text-center text-stone-500 dark:text-stone-400">
        {t('dashboard.noTripsMatchFilters')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {gridTrips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          memberCount={memberCounts[trip.id] ?? 0}
          isMenuOpen={openMenuId === trip.id}
          onToggleMenu={() => onToggleMenu(trip.id)}
          onClick={() => onOpenTrip(trip.id)}
          onArchive={() => onArchiveTrip(trip.id)}
          onDelete={() => onDeleteTrip(trip.id)}
        />
      ))}
    </div>
  );
}
