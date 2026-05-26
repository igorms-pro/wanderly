import axios from 'axios';

import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from './places-types';
import type { NearbyPlace } from './places-types';

const SEARCH_RADIUS_DEFAULT = 5000;
const SEARCH_RESULTS_LIMIT = 10;

export async function searchPlaces(
  query: string,
  location?: { lat: number; lng: number },
): Promise<NearbyPlace[]> {
  if (!hasGoogleMapsApiKey()) {
    return [];
  }
  try {
    const params: Record<string, unknown> = {
      key: GOOGLE_MAPS_API_KEY,
      query,
    };

    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = SEARCH_RADIUS_DEFAULT;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params,
    });

    if (response.data.status === 'OK') {
      return response.data.results.slice(0, SEARCH_RESULTS_LIMIT);
    }

    return [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error searching places:', error);
    }
    return [];
  }
}

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  if (!hasGoogleMapsApiKey()) {
    return null;
  }
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error geocoding address:', error);
    }
    return null;
  }
}
