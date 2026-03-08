import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';
import type { ActivityFormData } from '../types';

interface UseCreateActivityFormOptions {
  tripId: string;
  onSuccess: () => void;
}

type ActivityFormMode = 'create' | 'edit';

interface UseActivityFormBaseOptions {
  tripId: string;
  onSuccess: (activityId?: string) => void;
}

interface UseActivityFormCreateOptions extends UseActivityFormBaseOptions {
  mode: 'create';
}

interface UseActivityFormEditOptions extends UseActivityFormBaseOptions {
  mode: 'edit';
  activity: Activity;
  date?: string;
}

type UseActivityFormOptions = UseActivityFormCreateOptions | UseActivityFormEditOptions;

function buildInitialFormData(options: UseActivityFormOptions): ActivityFormData {
  if (options.mode === 'edit') {
    const { activity, date } = options;
    return {
      title: activity.title,
      description: activity.description ?? '',
      category: activity.category ?? '',
      date: date ?? activity.created_at.split('T')[0],
      startTime: activity.start_time ? activity.start_time.slice(0, 5) : '',
      endTime: activity.end_time ? activity.end_time.slice(0, 5) : '',
      cost:
        typeof activity.cost_cents === 'number'
          ? (activity.cost_cents / 100).toFixed(2).replace(/\.00$/, '')
          : '',
      costMin:
        activity.cost_min_cents != null
          ? (activity.cost_min_cents / 100).toFixed(2).replace(/\.00$/, '')
          : '',
      costMax:
        activity.cost_max_cents != null
          ? (activity.cost_max_cents / 100).toFixed(2).replace(/\.00$/, '')
          : '',
      currency: activity.currency ?? 'USD',
      lat: activity.lat != null ? String(activity.lat) : '',
      lon: activity.lon != null ? String(activity.lon) : '',
      placeName: activity.place_name ?? '',
      transportType: activity.transport_type ?? '',
      transportNotes: activity.transport_notes ?? '',
      transportDurationMinutes:
        activity.transport_duration_minutes != null
          ? String(activity.transport_duration_minutes)
          : '',
      status: activity.status,
    };
  }

  return {
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    cost: '',
    costMin: '',
    costMax: '',
    currency: 'USD',
    lat: '',
    lon: '',
    placeName: '',
    transportType: '',
    transportNotes: '',
    transportDurationMinutes: '',
    status: 'proposed',
  };
}

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

    if (!formData.title.trim()) {
      setError(t('activityModal.titleRequired') || 'Title is required');
      return;
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        setError(t('activityModal.endTimeAfterStart') || 'End time must be after start time');
        return;
      }
    }

    const costMinVal = formData.costMin.trim() ? parseFloat(formData.costMin) : NaN;
    const costMaxVal = formData.costMax.trim() ? parseFloat(formData.costMax) : NaN;
    if (formData.costMin.trim() && (Number.isNaN(costMinVal) || costMinVal < 0)) {
      setError(t('activityModal.invalidCost') || 'Cost must be a positive number');
      return;
    }
    if (formData.costMax.trim() && (Number.isNaN(costMaxVal) || costMaxVal < 0)) {
      setError(t('activityModal.invalidCost') || 'Cost must be a positive number');
      return;
    }
    if (!Number.isNaN(costMinVal) && !Number.isNaN(costMaxVal) && costMinVal > costMaxVal) {
      setError(t('activityModal.costMinMaxOrder') || 'Min cost must be less than or equal to max');
      return;
    }

    if (
      formData.lat &&
      (isNaN(parseFloat(formData.lat)) ||
        parseFloat(formData.lat) < -90 ||
        parseFloat(formData.lat) > 90)
    ) {
      setError(t('activityModal.invalidLatitude') || 'Latitude must be between -90 and 90');
      return;
    }
    if (
      formData.lon &&
      (isNaN(parseFloat(formData.lon)) ||
        parseFloat(formData.lon) < -180 ||
        parseFloat(formData.lon) > 180)
    ) {
      setError(t('activityModal.invalidLongitude') || 'Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);

    try {
      let start_time: string | undefined;
      let end_time: string | undefined;

      if (formData.startTime) {
        const timeParts = formData.startTime.split(':');
        start_time = timeParts.length === 2 ? `${formData.startTime}:00` : formData.startTime;
      }
      if (formData.endTime) {
        const timeParts = formData.endTime.split(':');
        end_time = timeParts.length === 2 ? `${formData.endTime}:00` : formData.endTime;
      }

      const itinerary_day_id =
        currentTrip?.id === tripId && formData.date
          ? (getActiveItineraryDayIdByDate(formData.date) ?? undefined)
          : undefined;

      const transportDuration =
        formData.transportDurationMinutes.trim() !== ''
          ? parseInt(formData.transportDurationMinutes, 10)
          : undefined;
      const validDuration =
        transportDuration !== undefined && !isNaN(transportDuration) && transportDuration >= 0
          ? transportDuration
          : undefined;

      const hasMin = formData.costMin.trim() !== '' && !Number.isNaN(parseFloat(formData.costMin));
      const hasMax = formData.costMax.trim() !== '' && !Number.isNaN(parseFloat(formData.costMax));
      let cost_min_cents: number | undefined;
      let cost_max_cents: number | undefined;
      if (hasMin && hasMax) {
        cost_min_cents = Math.round(parseFloat(formData.costMin) * 100);
        cost_max_cents = Math.round(parseFloat(formData.costMax) * 100);
      } else if (hasMin) {
        const c = Math.round(parseFloat(formData.costMin) * 100);
        cost_min_cents = c;
        cost_max_cents = c;
      } else if (hasMax) {
        const c = Math.round(parseFloat(formData.costMax) * 100);
        cost_min_cents = c;
        cost_max_cents = c;
      }

      if (options.mode === 'create') {
        await createActivity({
          trip_id: tripId,
          itinerary_day_id,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category || undefined,
          start_time,
          end_time,
          cost_cents: cost_min_cents ?? undefined,
          cost_min_cents,
          cost_max_cents,
          currency: formData.currency,
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lon: formData.lon ? parseFloat(formData.lon) : undefined,
          place_name: formData.placeName.trim() || undefined,
          transport_type: formData.transportType.trim() || undefined,
          transport_notes: formData.transportNotes.trim() || undefined,
          transport_duration_minutes: validDuration,
          status: formData.status,
          source: 'manual',
        });

        setFormData(
          buildInitialFormData({
            mode: 'create',
            tripId,
            onSuccess: () => {},
          }),
        );
        onSuccess();
      } else {
        await updateActivity(options.activity.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category || undefined,
          itinerary_day_id,
          start_time,
          end_time,
          cost_cents: cost_min_cents ?? undefined,
          cost_min_cents,
          cost_max_cents,
          currency: formData.currency,
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lon: formData.lon ? parseFloat(formData.lon) : undefined,
          place_name: formData.placeName.trim() || undefined,
          transport_type: formData.transportType.trim() || undefined,
          transport_notes: formData.transportNotes.trim() || undefined,
          transport_duration_minutes: validDuration,
          status: formData.status,
        });
        onSuccess(options.activity.id);
      }
    } catch (err: any) {
      console.error('Error saving activity:', err);
      let errorMessage =
        options.mode === 'create'
          ? t('errors.failedToCreateActivity') || 'Failed to create activity'
          : t('errors.failedToUpdateActivity') || 'Failed to update activity';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.code === '23505') {
        errorMessage = t('errors.duplicateActivity') || 'An activity with this name already exists';
      } else if (err.code === '23503') {
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
