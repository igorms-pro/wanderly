import { useEffect, useMemo, useState } from 'react';

import type { Activity } from '@/lib/types/database.types';

import {
  buildItineraryMapModel,
  findDefaultMapDate,
  type ItineraryMapModel,
} from '../lib/itineraryMapModel';

type UseTripExploreMapOptions = {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
};

type UseTripExploreMapResult = {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  mapModel: ItineraryMapModel;
};

export function useTripExploreMap({
  sortedDates,
  activitiesByDate,
}: UseTripExploreMapOptions): UseTripExploreMapResult {
  const defaultDate = useMemo(
    () => findDefaultMapDate(sortedDates, activitiesByDate),
    [sortedDates, activitiesByDate],
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate);

  useEffect(() => {
    if (defaultDate == null) {
      setSelectedDate(null);
      return;
    }
    if (selectedDate == null || !sortedDates.includes(selectedDate)) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate, selectedDate, sortedDates]);

  const mapModel = useMemo((): ItineraryMapModel => {
    if (sortedDates.length === 0) {
      return { kind: 'no-trip-days' };
    }
    const date = selectedDate ?? defaultDate;
    if (date == null) {
      return { kind: 'no-trip-days' };
    }
    return buildItineraryMapModel(date, activitiesByDate[date] ?? []);
  }, [activitiesByDate, defaultDate, selectedDate, sortedDates]);

  return {
    selectedDate,
    setSelectedDate,
    mapModel,
  };
}
