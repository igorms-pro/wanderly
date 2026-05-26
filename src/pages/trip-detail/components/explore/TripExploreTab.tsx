import type { TFunction } from 'i18next';

import type { Activity } from '@/lib/types/database.types';
import type { ExplorePlaceActivityImport } from '@/pages/trip-detail/lib/explorePlaceToActivity';

import { ExploreNearbyPlaces } from './ExploreNearbyPlaces';
import { TripItineraryMapSection } from './TripItineraryMapSection';

type TripExploreTabProps = {
  destination: string;
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  locale: string;
  t: TFunction;
  canAddToItinerary: boolean;
  onImportPlace: (date: string, payload: ExplorePlaceActivityImport) => Promise<void>;
};

export function TripExploreTab({
  destination,
  sortedDates,
  activitiesByDate,
  locale,
  t,
  canAddToItinerary,
  onImportPlace,
}: TripExploreTabProps) {
  return (
    <div className="space-y-8">
      <TripItineraryMapSection
        sortedDates={sortedDates}
        activitiesByDate={activitiesByDate}
        locale={locale}
        t={t}
      />
      <ExploreNearbyPlaces
        destination={destination}
        sortedDates={sortedDates}
        locale={locale}
        canAddToItinerary={canAddToItinerary}
        onImportPlace={onImportPlace}
      />
    </div>
  );
}
