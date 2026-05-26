import { lazy, Suspense } from 'react';
import { format, parseISO } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Loader2, MapPin } from 'lucide-react';
import type { TFunction } from 'i18next';

import type { Activity } from '@/lib/types/database.types';

import { useTripExploreMap } from '../../hooks/useTripExploreMap';
import type { ItineraryMapModel } from '../../lib/itineraryMapModel';

const TripItineraryMapView = lazy(() =>
  import('./TripItineraryMapView').then((m) => ({ default: m.TripItineraryMapView })),
);

const DATE_LOCALES = { en: enUS, fr } as const;

type TripItineraryMapSectionProps = {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  locale: string;
  t: TFunction;
};

function MapEmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center dark:border-stone-600 dark:bg-stone-900/40">
      <MapPin className="h-8 w-8 text-stone-400" aria-hidden />
      <p className="text-sm text-stone-600 dark:text-stone-400">{message}</p>
    </div>
  );
}

function formatDayLabel(date: string, locale: string): string {
  const parsed = parseISO(date);
  const dateLocale = locale.startsWith('fr') ? fr : DATE_LOCALES.en;
  return format(parsed, 'EEE d MMM', { locale: dateLocale });
}

function MapBody({ mapModel, t }: { mapModel: ItineraryMapModel; t: TFunction }) {
  if (mapModel.kind === 'no-trip-days') {
    return <MapEmptyState message={t('tripDetail.exploreMapEmptyNoDays')} />;
  }
  if (mapModel.kind === 'no-coordinates') {
    return <MapEmptyState message={t('tripDetail.exploreMapEmptyNoCoordinates')} />;
  }

  return (
    <Suspense
      fallback={
        <div
          className="flex h-[min(50vh,28rem)] items-center justify-center rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/40"
          aria-busy="true"
          aria-label={t('tripDetail.exploreMapLoading')}
        >
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" aria-hidden />
        </div>
      }
    >
      <TripItineraryMapView
        mapModel={mapModel}
        ariaLabel={t('tripDetail.exploreMapAria', { date: mapModel.date })}
      />
    </Suspense>
  );
}

export function TripItineraryMapSection({
  sortedDates,
  activitiesByDate,
  locale,
  t,
}: TripItineraryMapSectionProps) {
  const { selectedDate, setSelectedDate, mapModel } = useTripExploreMap({
    sortedDates,
    activitiesByDate,
  });

  const showDayPicker = sortedDates.length > 1 && selectedDate != null;

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-4 text-white">
        <h3 className="text-lg font-bold flex items-center">
          <MapPin className="w-5 h-5 mr-2" aria-hidden />
          {t('tripDetail.exploreMapTitle')}
        </h3>
        <p className="text-sm text-orange-100 mt-1">{t('tripDetail.exploreMapSubtitle')}</p>
      </div>

      {showDayPicker ? (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <label htmlFor="explore-map-day" className="sr-only">
            {t('tripDetail.exploreMapDayLabel')}
          </label>
          <select
            id="explore-map-day"
            value={selectedDate ?? ''}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto min-h-[44px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-stone-600 dark:bg-gray-900 dark:text-stone-100"
          >
            {sortedDates.map((date) => (
              <option key={date} value={date}>
                {formatDayLabel(date, locale)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="p-6">
        <MapBody mapModel={mapModel} t={t} />
        {mapModel.kind === 'ready' ? (
          <ol className="mt-4 space-y-2 border-t border-stone-200 pt-4 dark:border-stone-700">
            {mapModel.stops.map((stop) => (
              <li
                key={stop.activityId}
                className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white tabular-nums"
                  aria-hidden
                >
                  {stop.order}
                </span>
                <span>{stop.title}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
