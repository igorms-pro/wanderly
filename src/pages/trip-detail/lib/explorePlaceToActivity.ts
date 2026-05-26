import type { NearbyPlace, PlaceDetails } from '@/lib/places-service';
import type { Activity } from '@/lib/types/database.types';

import { mockPlaceDetailsFromNearby } from './mockPlaceDetails';

export type ExplorePlaceActivityImport = Pick<
  Activity,
  | 'title'
  | 'description'
  | 'category'
  | 'place_id'
  | 'place_name'
  | 'lat'
  | 'lon'
  | 'source'
  | 'status'
>;

function primaryCategory(types: string[]): string | null {
  const first = types[0];
  if (!first) return null;
  return first.replace(/_/g, ' ');
}

/** Maps a nearby place (and optional details) to a payload for `importScenarioActivityToItinerary`. */
export function mapExplorePlaceToActivityImport(
  place: NearbyPlace,
  details?: PlaceDetails | null,
): ExplorePlaceActivityImport {
  const resolved = details ?? mockPlaceDetailsFromNearby(place);
  const lat = resolved.geometry.location.lat;
  const lng = resolved.geometry.location.lng;

  return {
    title: resolved.name,
    description: resolved.formatted_address || place.vicinity,
    category: primaryCategory(resolved.types.length > 0 ? resolved.types : place.types),
    place_id: resolved.place_id,
    place_name: resolved.name,
    lat,
    lon: lng,
    source: 'import',
    status: 'proposed',
  };
}
