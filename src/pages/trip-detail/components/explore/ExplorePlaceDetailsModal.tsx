import { Clock, Loader2, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getPlacePhotoUrl, type NearbyPlace } from '@/lib/places-service';
import { useExplorePlaceDetails } from '@/pages/trip-detail/hooks/useExplorePlaceDetails';

import { formatPlacePriceLevel } from './explorePlaceFormatters';

type ExplorePlaceDetailsModalProps = {
  place: NearbyPlace | null;
  isOpen: boolean;
  canAddToItinerary: boolean;
  onClose: () => void;
  onAddToItinerary: () => void;
};

export function ExplorePlaceDetailsModal({
  place,
  isOpen,
  canAddToItinerary,
  onClose,
  onAddToItinerary,
}: ExplorePlaceDetailsModalProps) {
  const { t } = useTranslation();
  const { details, loading } = useExplorePlaceDetails(isOpen ? place : null);

  const photoUrl =
    details?.photos?.[0]?.photo_reference != null
      ? getPlacePhotoUrl(details.photos[0].photo_reference, 640)
      : null;

  const priceLabel = formatPlacePriceLevel(details?.price_level);
  const hours = details?.opening_hours?.weekday_text ?? [];

  return (
    <Modal
      isOpen={isOpen && place != null}
      onClose={onClose}
      title={details?.name ?? place?.name}
      contentClassName="max-w-xl"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.close')}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!canAddToItinerary}
            onClick={onAddToItinerary}
            aria-label={t('tripDetail.exploreAddToItinerary')}
          >
            {t('tripDetail.addActivityToItinerary')}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div
          className="flex justify-center py-10"
          aria-busy="true"
          aria-label={t('tripDetail.explorePlaceDetailsLoading')}
        >
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" aria-hidden />
        </div>
      ) : details ? (
        <div className="space-y-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-48 w-full rounded-xl object-cover"
              loading="lazy"
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
            {details.rating != null ? (
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                {details.rating.toFixed(1)}
                {details.user_ratings_total != null
                  ? ` (${t('tripDetail.explorePlaceRatingsCount', { count: details.user_ratings_total })})`
                  : null}
              </span>
            ) : null}
            {priceLabel ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-stone-700">
                {t('tripDetail.explorePlacePriceLevel', { level: priceLabel })}
              </span>
            ) : null}
            {details.opening_hours?.open_now != null ? (
              <span
                className={
                  details.opening_hours.open_now
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {details.opening_hours.open_now
                  ? t('tripDetail.explorePlaceOpenNow')
                  : t('tripDetail.explorePlaceClosedNow')}
              </span>
            ) : null}
          </div>

          <p className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-200">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {details.formatted_address}
          </p>

          {hours.length > 0 ? (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                <Clock className="h-4 w-4" aria-hidden />
                {t('tripDetail.explorePlaceHoursTitle')}
              </h3>
              <ul className="space-y-1 text-sm text-stone-600 dark:text-stone-300">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t('tripDetail.explorePlaceHoursUnavailable')}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t('tripDetail.explorePlaceDetailsUnavailable')}
        </p>
      )}
    </Modal>
  );
}
