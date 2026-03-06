import { useEffect, useState } from 'react';

import type { Activity } from '@/lib/types/database.types';
import { useItinerarySearch } from './useItinerarySearch';
import type { ItineraryViewMode } from './TripDetailItinerary';

const ITINERARY_VIEW_KEY = 'tripDetail:itineraryView';

interface UseItineraryViewStateArgs {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
}

interface UseItineraryViewStateResult {
  viewMode: ItineraryViewMode;
  selectedDate: string | null;
  searchQuery: string;
  activitiesByDateForView: Record<string, Activity[]>;
  sortedDatesForView: string[];
  handleChangeViewMode: (mode: ItineraryViewMode) => void;
  handleSelectDate: (date: string | null) => void;
  handleSearchChange: (value: string) => void;
}

export function useItineraryViewState({
  activitiesByDate,
  sortedDates,
}: UseItineraryViewStateArgs): UseItineraryViewStateResult {
  const [viewMode, setViewMode] = useState<ItineraryViewMode>(() => {
    try {
      const s = sessionStorage.getItem(ITINERARY_VIEW_KEY);
      if (s === 'list' || s === 'calendar' || s === 'timeline') return s;
    } catch {
      /* ignore */
    }
    return 'list';
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { activitiesByDate: filteredActivitiesByDate, sortedDates: filteredSortedDates } =
    useItinerarySearch(activitiesByDate, sortedDates, searchQuery);

  useEffect(() => {
    try {
      sessionStorage.setItem(ITINERARY_VIEW_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  const isSearching = searchQuery.trim().length > 0;

  const activitiesByDateForView = isSearching ? filteredActivitiesByDate : activitiesByDate;
  const sortedDatesForView = isSearching ? filteredSortedDates : sortedDates;

  const handleChangeViewMode = (mode: ItineraryViewMode) => {
    setViewMode(mode);
    setSelectedDate(null);
  };

  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return {
    viewMode,
    selectedDate,
    searchQuery,
    activitiesByDateForView,
    sortedDatesForView,
    handleChangeViewMode,
    handleSelectDate,
    handleSearchChange,
  };
}
