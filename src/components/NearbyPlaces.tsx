import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Star, Loader2, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  geocodeAddress,
  getMockNearbyPlaces,
  getNearbyPlaces,
  type NearbyPlace,
} from '@/lib/places-service';

const PLACE_FILTER_OPTIONS = [
  { value: 'tourist_attraction', labelKey: 'tripDetail.explorePlaceTypeTouristAttraction' },
  { value: 'restaurant', labelKey: 'tripDetail.explorePlaceTypeRestaurant' },
  { value: 'museum', labelKey: 'tripDetail.explorePlaceTypeMuseum' },
  { value: 'park', labelKey: 'tripDetail.explorePlaceTypePark' },
  { value: 'shopping_mall', labelKey: 'tripDetail.explorePlaceTypeShoppingMall' },
] as const;

type NearbyPlacesProps = {
  destination: string;
};

export default function NearbyPlaces({ destination }: NearbyPlacesProps) {
  const { t } = useTranslation();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('tourist_attraction');

  const placeTypes = useMemo(
    () =>
      PLACE_FILTER_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
      })),
    [t],
  );

  const loadNearbyPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const location = await geocodeAddress(destination);

      if (location) {
        const nearbyPlaces = await getNearbyPlaces(location.lat, location.lng, selectedType, 5000);

        if (nearbyPlaces.length > 0) {
          setPlaces(nearbyPlaces);
        } else {
          setPlaces(getMockNearbyPlaces(destination));
        }
      } else {
        setPlaces(getMockNearbyPlaces(destination));
      }
    } catch {
      setPlaces(getMockNearbyPlaces(destination));
    } finally {
      setLoading(false);
    }
  }, [destination, selectedType]);

  useEffect(() => {
    void loadNearbyPlaces();
  }, [loadNearbyPlaces]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-4 text-white">
        <h3 className="text-lg font-bold flex items-center">
          <MapPin className="w-5 h-5 mr-2" aria-hidden />
          {t('tripDetail.exploreNearbyTitle')}
        </h3>
        <p className="text-sm text-orange-100 mt-1">
          {t('tripDetail.exploreNearbySubtitle', { destination })}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label={t('tripDetail.exploreNearbyTitle')}
        >
          {placeTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              role="tab"
              aria-selected={selectedType === type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                selectedType === type.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div
            className="flex items-center justify-center py-8"
            aria-busy="true"
            aria-label={t('tripDetail.exploreNearbyLoading')}
          >
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" aria-hidden />
          </div>
        ) : places.length === 0 ? (
          <p className="text-gray-500 text-center py-4 dark:text-gray-400">
            {t('tripDetail.exploreNearbyEmptyCategory')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map((place) => (
              <div
                key={place.place_id}
                className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 hover:shadow-md transition cursor-pointer dark:from-gray-800 dark:to-gray-800/80"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex-1 dark:text-gray-100">
                    {place.name}
                  </h4>
                  {place.rating ? (
                    <div className="flex items-center ml-2 bg-white rounded-full px-2 py-1 dark:bg-gray-900">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" aria-hidden />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {place.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-start text-sm text-gray-600 mb-3 dark:text-gray-400">
                  <Navigation className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" aria-hidden />
                  <span className="line-clamp-2">{place.vicinity}</span>
                </div>

                {place.types && place.types.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {place.types.slice(0, 3).map((ptype, index) => (
                      <span
                        key={`${place.place_id}-t-${index}`}
                        className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300"
                      >
                        {ptype.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
