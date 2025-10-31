// Google Places API Service
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk';

export interface PlaceDetails {
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  photos?: PlacePhoto[];
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
}

export interface PlacePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

export interface NearbyPlace {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: PlacePhoto[];
}

export async function searchPlaces(
  query: string,
  location?: { lat: number; lng: number }
): Promise<NearbyPlace[]> {
  try {
    const params: any = {
      key: GOOGLE_MAPS_API_KEY,
      query,
    };

    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = 5000; // 5km radius
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      { params }
    );

    if (response.data.status === 'OK') {
      return response.data.results.slice(0, 10);
    }

    return [];
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

export async function getNearbyPlaces(
  lat: number,
  lng: number,
  type: string = 'tourist_attraction',
  radius: number = 5000
): Promise<NearbyPlace[]> {
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
      }
    );

    if (response.data.status === 'OK') {
      return response.data.results.slice(0, 10);
    }

    return [];
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,rating,user_ratings_total,price_level,types,photos,opening_hours,geometry',
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

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

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

// Mock data for when API is unavailable
export function getMockNearbyPlaces(destination: string): NearbyPlace[] {
  const mockPlaces: { [key: string]: NearbyPlace[] } = {
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
        geometry: { location: { lat: 48.8530, lng: 2.3499 } },
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

  return mockPlaces[destination] || mockPlaces.default;
}
