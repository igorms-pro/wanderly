import { useCallback, useEffect, useState } from 'react';

import { getPlaceDetails, type NearbyPlace, type PlaceDetails } from '@/lib/places-service';
import { mockPlaceDetailsFromNearby } from '@/pages/trip-detail/lib/mockPlaceDetails';

type UseExplorePlaceDetailsResult = {
  details: PlaceDetails | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
};

export function useExplorePlaceDetails(place: NearbyPlace | null): UseExplorePlaceDetailsResult {
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!place) {
      setDetails(null);
      setError(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const fromApi = await getPlaceDetails(place.place_id);
      setDetails(fromApi ?? mockPlaceDetailsFromNearby(place));
    } catch {
      setDetails(mockPlaceDetailsFromNearby(place));
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [place]);

  useEffect(() => {
    void load();
  }, [load]);

  return { details, loading, error, reload: load };
}
