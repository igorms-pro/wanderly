import axios from 'axios';

import { GOOGLE_MAPS_API_KEY } from './places-types';
import type { PlaceDetails } from './places-types';

const PLACE_DETAIL_FIELDS =
  'name,formatted_address,rating,user_ratings_total,price_level,types,photos,opening_hours,geometry';

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: PLACE_DETAIL_FIELDS,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }

    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

export function getPlacePhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}
