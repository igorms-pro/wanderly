import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/store';
import type { TripConstraints } from '@/lib/types/database.types';

import { useActivityAiSuggestions } from '../hooks/useActivityAiSuggestions';
import type { ActivityFormData } from '../types';

const EMPTY_INTERESTS: string[] = [];

type ActivityFormAiSuggestionsProps = {
  tripId: string;
  tripDestination: string;
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
  excludeActivityId?: string | null;
};

export function ActivityFormAiSuggestions({
  tripId,
  tripDestination,
  formData,
  onChange,
  excludeActivityId,
}: ActivityFormAiSuggestionsProps) {
  const { t, i18n } = useTranslation();
  const activities = useStore((s) => s.activities);
  const getActiveItineraryDayIdByDate = useStore((s) => s.getActiveItineraryDayIdByDate);
  const currentTrip = useStore((s) => s.currentTrip);

  const interests = useMemo(() => {
    const raw = currentTrip?.constraints as TripConstraints | null | undefined;
    const prefs = raw?.preferences?.trim();
    return prefs ? [prefs] : EMPTY_INTERESTS;
  }, [currentTrip?.constraints]);

  const {
    loading,
    suggestions,
    lastFetchEmpty,
    suggestionsQuotaExceeded,
    fetchSuggestions,
    clearSuggestions,
    applySuggestion,
  } = useActivityAiSuggestions({
    tripId,
    tripDestination,
    locale: i18n.language,
  });

  const existingTitles = useMemo(() => {
    if (!formData.date) return [];
    const dayId = getActiveItineraryDayIdByDate(formData.date);
    return activities
      .filter(
        (a) =>
          a.trip_id === tripId &&
          a.itinerary_day_id === dayId &&
          (!excludeActivityId || a.id !== excludeActivityId),
      )
      .map((a) => a.title)
      .filter(Boolean);
  }, [activities, tripId, formData.date, getActiveItineraryDayIdByDate, excludeActivityId]);

  useEffect(() => {
    clearSuggestions();
  }, [formData.date, clearSuggestions]);

  const handleSuggest = () => {
    void fetchSuggestions({
      date: formData.date,
      existingTitles,
      interests: interests.length > 0 ? interests : undefined,
    });
  };

  const showEmptyHint =
    !loading && formData.date.trim().length > 0 && lastFetchEmpty && !suggestionsQuotaExceeded;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {t('activityModal.aiSuggestionsTitle')}
      </h4>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        {t('activityModal.aiSuggestionsHint')}
      </p>
      {suggestionsQuotaExceeded ? (
        <p className="mt-2 text-xs text-rose-600 dark:text-rose-400" role="alert">
          {t('activityModal.aiSuggestionsQuotaExceeded')}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading || !formData.date.trim()}
          onClick={handleSuggest}
          className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {loading
            ? t('activityModal.aiSuggestionsLoading')
            : t('activityModal.aiSuggestionsButton')}
        </button>
        {!formData.date.trim() ? (
          <span className="text-xs text-amber-700 dark:text-amber-400">
            {t('activityModal.aiSuggestionsNeedDate')}
          </span>
        ) : null}
      </div>
      {suggestions.length > 0 ? (
        <ul className="mt-3 space-y-2" aria-label={t('activityModal.aiSuggestionsTitle')}>
          {suggestions.map((s) => {
            const key = `${s.title}-${s.suggestedTimeOfDay}`;
            return (
              <li
                key={key}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800/60"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {s.title}
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{s.description}</p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-orange-600 hover:text-orange-700 focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500 dark:text-orange-400"
                  onClick={() => onChange(applySuggestion(s))}
                  aria-label={t('activityModal.aiSuggestionsApplyAria', { title: s.title })}
                >
                  {t('activityModal.aiSuggestionsApply')}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {showEmptyHint ? (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('activityModal.aiSuggestionsEmpty')}
        </p>
      ) : null}
    </div>
  );
}
