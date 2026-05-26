import type { TFunction } from 'i18next';

import NearbyPlaces from '@/components/NearbyPlaces';
import type { Activity } from '@/lib/types/database.types';

import { TripItineraryMapSection } from './TripItineraryMapSection';

type TripExploreTabProps = {
  destination: string;
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  locale: string;
  t: TFunction;
};

export function TripExploreTab({
  destination,
  sortedDates,
  activitiesByDate,
  locale,
  t,
}: TripExploreTabProps) {
  return (
    <div className="space-y-8">
      <TripItineraryMapSection
        sortedDates={sortedDates}
        activitiesByDate={activitiesByDate}
        locale={locale}
        t={t}
      />
      <NearbyPlaces destination={destination} />
    </div>
  );
}
