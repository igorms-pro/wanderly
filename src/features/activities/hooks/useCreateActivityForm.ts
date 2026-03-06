import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/store';
import type { ActivityFormData } from '../types';

interface UseCreateActivityFormOptions {
  tripId: string;
  onSuccess: () => void;
}

export function useCreateActivityForm({ tripId, onSuccess }: UseCreateActivityFormOptions) {
  const { t } = useTranslation();
  const createActivity = useStore((state) => state.createActivity);
  const currentTrip = useStore((state) => state.currentTrip);
  const getActiveItineraryDayIdByDate = useStore((state) => state.getActiveItineraryDayIdByDate);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    cost: '',
    currency: 'USD',
    lat: '',
    lon: '',
    status: 'proposed' as 'proposed' | 'confirmed' | 'rejected',
  });

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

    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) {
      setError(t('activityModal.invalidCost') || 'Cost must be a positive number');
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

      await createActivity({
        trip_id: tripId,
        itinerary_day_id:
          currentTrip?.id === tripId && formData.date
            ? (getActiveItineraryDayIdByDate(formData.date) ?? undefined)
            : undefined,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category || undefined,
        start_time,
        end_time,
        cost_cents: formData.cost ? Math.round(parseFloat(formData.cost) * 100) : undefined,
        currency: formData.currency,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lon: formData.lon ? parseFloat(formData.lon) : undefined,
        status: formData.status,
        source: 'manual',
      });

      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        startTime: '',
        endTime: '',
        cost: '',
        currency: 'USD',
        lat: '',
        lon: '',
        status: 'proposed',
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error creating activity:', err);
      let errorMessage = t('errors.failedToCreateActivity') || 'Failed to create activity';
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
