import { useCallback, useState } from 'react';

import { AiSuggestionsEdgeError } from '@/lib/ai/aiEdgeClient';
import {
  generateActivitySuggestions,
  type AIActivitySuggestion,
} from '@/lib/ai/openai-itinerary-service';

import type { ActivityFormData } from '../types';

const TIME_BY_SLOT: Record<
  AIActivitySuggestion['suggestedTimeOfDay'],
  { start: string; end: string }
> = {
  morning: { start: '09:00', end: '11:00' },
  afternoon: { start: '14:00', end: '16:00' },
  evening: { start: '18:00', end: '20:00' },
  night: { start: '21:00', end: '23:00' },
};

export type UseActivityAiSuggestionsOptions = {
  tripId: string;
  tripDestination: string;
  locale: string;
};

export function useActivityAiSuggestions({
  tripId,
  tripDestination,
  locale,
}: UseActivityAiSuggestionsOptions) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIActivitySuggestion[]>([]);
  const [lastFetchEmpty, setLastFetchEmpty] = useState(false);
  const [suggestionsQuotaExceeded, setSuggestionsQuotaExceeded] = useState(false);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setLastFetchEmpty(false);
    setSuggestionsQuotaExceeded(false);
  }, []);

  const fetchSuggestions = useCallback(
    async (input: { date: string; existingTitles: string[]; interests?: string[] }) => {
      if (!input.date.trim()) {
        setSuggestions([]);
        setLastFetchEmpty(false);
        return;
      }
      setLoading(true);
      try {
        setSuggestionsQuotaExceeded(false);
        const list = await generateActivitySuggestions({
          tripId,
          destination: tripDestination.trim() || 'Trip',
          date: input.date,
          existingActivities: input.existingTitles,
          interests: input.interests,
          locale,
        });
        setSuggestions(list);
        setLastFetchEmpty(list.length === 0);
      } catch (e) {
        if (e instanceof AiSuggestionsEdgeError && e.code === 'suggestions_quota_exceeded') {
          setSuggestionsQuotaExceeded(true);
          setSuggestions([]);
          setLastFetchEmpty(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [tripId, tripDestination, locale],
  );

  const applySuggestion = useCallback((s: AIActivitySuggestion): Partial<ActivityFormData> => {
    const slot = TIME_BY_SLOT[s.suggestedTimeOfDay];
    return {
      title: s.title,
      description: s.description,
      category: s.category,
      startTime: slot.start,
      endTime: slot.end,
    };
  }, []);

  return {
    loading,
    suggestions,
    lastFetchEmpty,
    suggestionsQuotaExceeded,
    fetchSuggestions,
    clearSuggestions,
    applySuggestion,
  };
}
