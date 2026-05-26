export const GOOGLE_MAPS_API_KEY =
  typeof import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'string'
    ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY.trim()
    : '';

export function hasGoogleMapsApiKey(): boolean {
  return GOOGLE_MAPS_API_KEY.length > 0;
}

export interface PlacePhoto {
  photo_reference: string;
  width: number;
  height: number;
}

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
