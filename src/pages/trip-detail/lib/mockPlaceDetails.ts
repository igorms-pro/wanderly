import type { NearbyPlace, PlaceDetails } from '@/lib/places-service';

/** Builds place details from nearby search / mock card data when Details API is unavailable. */
export function mockPlaceDetailsFromNearby(place: NearbyPlace): PlaceDetails {
  return {
    place_id: place.place_id,
    name: place.name,
    formatted_address: place.vicinity,
    rating: place.rating,
    types: place.types ?? [],
    photos: place.photos,
    geometry: place.geometry,
  };
}
