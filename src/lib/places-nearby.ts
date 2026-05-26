import axios from 'axios';

import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from './places-types';
import type { NearbyPlace } from './places-types';

const NEARBY_RESULTS_LIMIT = 10;

export async function getNearbyPlaces(
  lat: number,
  lng: number,
  type: string = 'tourist_attraction',
  radius: number = 5000,
): Promise<NearbyPlace[]> {
  if (!hasGoogleMapsApiKey()) {
    return [];
  }
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          type,
          key: GOOGLE_MAPS_API_KEY,
        },
      },
    );

    if (response.data.status === 'OK') {
      return response.data.results.slice(0, NEARBY_RESULTS_LIMIT);
    }

    return [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching nearby places:', error);
    }
    return [];
  }
}

const MOCK_PLACES: Record<string, NearbyPlace[]> = {
  Paris: [
    {
      place_id: 'mock_eiffel',
      name: 'Eiffel Tower',
      vicinity: 'Champ de Mars, 5 Avenue Anatole France',
      rating: 4.7,
      types: ['tourist_attraction', 'point_of_interest'],
      geometry: { location: { lat: 48.8584, lng: 2.2945 } },
    },
    {
      place_id: 'mock_louvre',
      name: 'Louvre Museum',
      vicinity: 'Rue de Rivoli',
      rating: 4.8,
      types: ['museum', 'tourist_attraction'],
      geometry: { location: { lat: 48.8606, lng: 2.3376 } },
    },
    {
      place_id: 'mock_notredame',
      name: 'Notre-Dame Cathedral',
      vicinity: '6 Parvis Notre-Dame',
      rating: 4.7,
      types: ['church', 'tourist_attraction'],
      geometry: { location: { lat: 48.853, lng: 2.3499 } },
    },
  ],
  default: [
    {
      place_id: 'mock_1',
      name: 'City Center',
      vicinity: 'Downtown',
      rating: 4.5,
      types: ['tourist_attraction'],
      geometry: { location: { lat: 0, lng: 0 } },
    },
  ],
};

export function getMockNearbyPlaces(destination: string): NearbyPlace[] {
  return MOCK_PLACES[destination] ?? MOCK_PLACES.default;
}
