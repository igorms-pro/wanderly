import { useCallback } from 'react';
import type { TFunction } from 'i18next';
import { AiScenarioGenerationError } from '@/lib/ai/aiScenarioGenerationError';
import type { Activity } from '@/lib/types/database.types';
import type { ExplorePlaceActivityImport } from '@/pages/trip-detail/lib/explorePlaceToActivity';
import type { ToastItem } from '@/contexts/ToastContext';

type HandlersOptions = {
  tripId: string | undefined;
  currentTrip: { id: string } | null;
  tripMembersCount: number;
  locale: string;
  t: TFunction;
  addToast: (item: Omit<ToastItem, 'id'>) => string;
  generateAiScenario: (trip: { id: string }, membersCount: number, locale: string) => Promise<void>;
  applyScenarioAsBase: (tripId: string, scenarioId: string) => Promise<void>;
  importScenarioActivityToItinerary: (
    tripId: string,
    date: string,
    activity: Activity | ExplorePlaceActivityImport,
  ) => Promise<void>;
  setActivityToEdit: (value: { activity: Activity; date: string } | null) => void;
  setActivityToDelete: (activity: Activity | null) => void;
};

export function useTripDetailPageHandlers(options: HandlersOptions) {
  const {
    tripId,
    currentTrip,
    tripMembersCount,
    locale,
    t,
    addToast,
    generateAiScenario,
    applyScenarioAsBase,
    importScenarioActivityToItinerary,
    setActivityToEdit,
    setActivityToDelete,
  } = options;

  const handleImportPlace = useCallback(
    async (date: string, payload: ExplorePlaceActivityImport) => {
      if (!tripId) return;
      try {
        await importScenarioActivityToItinerary(tripId, date, payload);
        addToast({ variant: 'success', message: t('tripDetail.exploreAddToItinerarySuccess') });
      } catch {
        addToast({ variant: 'error', message: t('tripDetail.exploreAddToItineraryError') });
      }
    },
    [tripId, importScenarioActivityToItinerary, addToast, t],
  );

  const handleGenerateAiScenario = useCallback(async () => {
    if (!currentTrip) return;
    try {
      await generateAiScenario(currentTrip, tripMembersCount, locale);
      addToast({ variant: 'success', message: t('tripDetail.aiGenerateSuccess') });
    } catch (e) {
      if (e instanceof AiScenarioGenerationError) {
        addToast({ variant: 'error', message: t(e.i18nKey()) });
        return;
      }
      addToast({ variant: 'error', message: t('tripDetail.aiGenerateErrorGeneric') });
    }
  }, [currentTrip, tripMembersCount, locale, generateAiScenario, addToast, t]);

  const handleUseScenarioAsBase = useCallback(
    async (scenarioId: string) => {
      if (!tripId) return;
      await applyScenarioAsBase(tripId, scenarioId);
    },
    [tripId, applyScenarioAsBase],
  );

  const handleAddScenarioActivityToItinerary = useCallback(
    async (date: string, activity: Activity) => {
      if (!tripId) return;
      await importScenarioActivityToItinerary(tripId, date, activity);
    },
    [tripId, importScenarioActivityToItinerary],
  );

  const handleEditActivity = useCallback(
    (activity: Activity, date?: string) => {
      if (!date) return;
      setActivityToEdit({ activity, date });
    },
    [setActivityToEdit],
  );

  const handleDeleteActivity = useCallback(
    (activity: Activity) => {
      setActivityToDelete(activity);
    },
    [setActivityToDelete],
  );

  return {
    handleImportPlace,
    handleGenerateAiScenario,
    handleUseScenarioAsBase,
    handleAddScenarioActivityToItinerary,
    handleEditActivity,
    handleDeleteActivity,
  };
}
