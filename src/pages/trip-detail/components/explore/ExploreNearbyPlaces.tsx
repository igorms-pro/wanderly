import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Star, Loader2, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  geocodeAddress,
  getMockNearbyPlaces,
  getNearbyPlaces,
  type NearbyPlace,
} from '@/lib/places-service';
import { mapExplorePlaceToActivityImport } from '@/pages/trip-detail/lib/explorePlaceToActivity';

import { ExploreAddToItineraryModal } from './ExploreAddToItineraryModal';
import { ExplorePlaceDetailsModal } from './ExplorePlaceDetailsModal';

const PLACE_FILTER_OPTIONS = [
  { value: 'tourist_attraction', labelKey: 'tripDetail.explorePlaceTypeTouristAttraction' },
  { value: 'restaurant', labelKey: 'tripDetail.explorePlaceTypeRestaurant' },
  { value: 'museum', labelKey: 'tripDetail.explorePlaceTypeMuseum' },
  { value: 'park', labelKey: 'tripDetail.explorePlaceTypePark' },
  { value: 'shopping_mall', labelKey: 'tripDetail.explorePlaceTypeShoppingMall' },
] as const;

type ExploreNearbyPlacesProps = {
  destination: string;
  sortedDates: string[];
  locale: string;
  canAddToItinerary: boolean;
  onImportPlace: (
    date: string,
    payload: ReturnType<typeof mapExplorePlaceToActivityImport>,
  ) => Promise<void>;
};

export function ExploreNearbyPlaces({
  destination,
  sortedDates,
  locale,
  canAddToItinerary,
  onImportPlace,
}: ExploreNearbyPlacesProps) {
  const { t } = useTranslation();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('tourist_attraction');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importing, setImporting] = useState(false);

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

  const handlePlaceClick = useCallback((place: NearbyPlace) => {
    setSelectedPlace(place);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedPlace(null);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setDetailsOpen(false);
    setAddOpen(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setAddOpen(false);
    if (!importing) setSelectedPlace(null);
  }, [importing]);

  const handleConfirmAdd = useCallback(
    async (date: string) => {
      if (!selectedPlace) return;
      setImporting(true);
      try {
        const payload = mapExplorePlaceToActivityImport(selectedPlace);
        await onImportPlace(date, payload);
        setAddOpen(false);
        setSelectedPlace(null);
      } finally {
        setImporting(false);
      }
    },
    [onImportPlace, selectedPlace],
  );

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900">
        <div className="bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-4 text-white">
          <h3 className="flex items-center text-lg font-bold">
            <MapPin className="mr-2 h-5 w-5" aria-hidden />
            {t('tripDetail.exploreNearbyTitle')}
          </h3>
          <p className="mt-1 text-sm text-orange-100">
            {t('tripDetail.exploreNearbySubtitle', { destination })}
          </p>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
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
                className={`rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
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
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" aria-hidden />
            </div>
          ) : places.length === 0 ? (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
              {t('tripDetail.exploreNearbyEmptyCategory')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {places.map((place) => (
                <button
                  key={place.place_id}
                  type="button"
                  onClick={() => handlePlaceClick(place)}
                  className="rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 p-4 text-left transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:from-gray-800 dark:to-gray-800/80"
                  aria-label={t('tripDetail.explorePlaceCardAria', { name: place.name })}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="flex-1 font-semibold text-gray-900 dark:text-gray-100">
                      {place.name}
                    </h4>
                    {place.rating ? (
                      <div className="ml-2 flex items-center rounded-full bg-white px-2 py-1 dark:bg-gray-900">
                        <Star
                          className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500"
                          aria-hidden
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {place.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-3 flex items-start text-sm text-gray-600 dark:text-gray-400">
                    <Navigation className="mr-1 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="line-clamp-2">{place.vicinity}</span>
                  </div>

                  {place.types && place.types.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {place.types.slice(0, 3).map((ptype, index) => (
                        <span
                          key={`${place.place_id}-t-${index}`}
                          className="rounded-full bg-white px-2 py-1 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300"
                        >
                          {ptype.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ExplorePlaceDetailsModal
        place={selectedPlace}
        isOpen={detailsOpen}
        canAddToItinerary={canAddToItinerary}
        onClose={handleCloseDetails}
        onAddToItinerary={handleOpenAdd}
      />

      <ExploreAddToItineraryModal
        isOpen={addOpen}
        placeName={selectedPlace?.name ?? ''}
        sortedDates={sortedDates}
        locale={locale}
        loading={importing}
        onClose={handleCloseAdd}
        onConfirm={handleConfirmAdd}
      />
    </>
  );
}
