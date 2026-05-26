import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';

import type { ActivityFormData } from '../types';
import {
  buildActivityPayload,
  buildInitialFormData,
  validateActivityFormData,
} from './activityFormHelpers';
import type { UseActivityFormOptions } from './activityFormHelpers';

export type { UseActivityFormOptions } from './activityFormHelpers';

export function useActivityForm(options: UseActivityFormOptions) {
  const { tripId, onSuccess } = options;
  const { t } = useTranslation();
  const createActivity = useStore((state) => state.createActivity);
  const updateActivity = useStore((state) => state.updateActivity);
  const currentTrip = useStore((state) => state.currentTrip);
  const getActiveItineraryDayIdByDate = useStore((state) => state.getActiveItineraryDayIdByDate);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>(() => buildInitialFormData(options));

  const handleChange = (updates: Partial<ActivityFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateActivityFormData(formData, t);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const itinerary_day_id =
        currentTrip?.id === tripId && formData.date
          ? (getActiveItineraryDayIdByDate(formData.date) ?? undefined)
          : undefined;

      const payload = buildActivityPayload(formData, itinerary_day_id);

      if (options.mode === 'create') {
        await createActivity({ trip_id: tripId, source: 'manual', ...payload });
        setFormData(
          buildInitialFormData({
            mode: 'create',
            tripId,
            onSuccess: () => {},
          }),
        );
        onSuccess();
      } else {
        await updateActivity(options.activity.id, payload);
        onSuccess(options.activity.id);
      }
    } catch (err: unknown) {
      console.error('Error saving activity:', err);
      const anyErr = err as { message?: string; code?: string };
      let errorMessage =
        options.mode === 'create'
          ? t('errors.failedToCreateActivity') || 'Failed to create activity'
          : t('errors.failedToUpdateActivity') || 'Failed to update activity';
      if (anyErr.message) {
        errorMessage = anyErr.message;
      } else if (anyErr.code === '23505') {
        errorMessage = t('errors.duplicateActivity') || 'An activity with this name already exists';
      } else if (anyErr.code === '23503') {
        errorMessage = t('errors.invalidTrip') || 'Invalid trip reference';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    setError,
    handleChange,
    handleSubmit,
  };
}

interface UseCreateActivityFormOptions {
  tripId: string;
  onSuccess: () => void;
}

export function useCreateActivityForm({ tripId, onSuccess }: UseCreateActivityFormOptions) {
  return useActivityForm({ mode: 'create', tripId, onSuccess });
}

export interface UseEditActivityFormOptions {
  tripId: string;
  activity: Activity;
  date?: string;
  /** Called after successful save; in edit mode, receives the activity id. */
  onSuccess: (activityId?: string) => void;
}

export function useEditActivityForm({
  tripId,
  activity,
  date,
  onSuccess,
}: UseEditActivityFormOptions) {
  return useActivityForm({ mode: 'edit', tripId, activity, date, onSuccess });
}
