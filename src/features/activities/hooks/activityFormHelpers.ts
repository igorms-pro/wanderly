import type { Activity } from '@/lib/types/database.types';

import type { ActivityFormData } from '../types';

export interface UseActivityFormBaseOptions {
  tripId: string;
  onSuccess: (activityId?: string) => void;
}

export interface UseActivityFormCreateOptions extends UseActivityFormBaseOptions {
  mode: 'create';
}

export interface UseActivityFormEditOptions extends UseActivityFormBaseOptions {
  mode: 'edit';
  activity: Activity;
  date?: string;
}

export type UseActivityFormOptions = UseActivityFormCreateOptions | UseActivityFormEditOptions;

export interface ActivityBasePayload {
  title: string;
  description?: string;
  category?: string;
  itinerary_day_id?: string;
  start_time?: string;
  end_time?: string;
  cost_cents?: number;
  cost_min_cents?: number;
  cost_max_cents?: number;
  currency: string;
  lat?: number;
  lon?: number;
  place_name?: string;
  transport_type?: string;
  transport_notes?: string;
  transport_duration_minutes?: number;
  status: 'proposed' | 'confirmed' | 'rejected';
  organizer_notes?: string;
}

export function buildInitialFormData(options: UseActivityFormOptions): ActivityFormData {
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
      organizerNotes: activity.organizer_notes ?? '',
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
    organizerNotes: '',
  };
}

export function validateActivityFormData(
  formData: ActivityFormData,
  t: (key: string) => string,
): string | null {
  if (!formData.title.trim()) {
    return t('activityModal.titleRequired') || 'Title is required';
  }

  if (formData.startTime && formData.endTime) {
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    if (end <= start) {
      return t('activityModal.endTimeAfterStart') || 'End time must be after start time';
    }
  }

  const costMinVal = formData.costMin.trim() ? parseFloat(formData.costMin) : NaN;
  const costMaxVal = formData.costMax.trim() ? parseFloat(formData.costMax) : NaN;
  if (formData.costMin.trim() && (Number.isNaN(costMinVal) || costMinVal < 0)) {
    return t('activityModal.invalidCost') || 'Cost must be a positive number';
  }
  if (formData.costMax.trim() && (Number.isNaN(costMaxVal) || costMaxVal < 0)) {
    return t('activityModal.invalidCost') || 'Cost must be a positive number';
  }
  if (!Number.isNaN(costMinVal) && !Number.isNaN(costMaxVal) && costMinVal > costMaxVal) {
    return t('activityModal.costMinMaxOrder') || 'Min cost must be less than or equal to max';
  }

  if (
    formData.lat &&
    (isNaN(parseFloat(formData.lat)) ||
      parseFloat(formData.lat) < -90 ||
      parseFloat(formData.lat) > 90)
  ) {
    return t('activityModal.invalidLatitude') || 'Latitude must be between -90 and 90';
  }
  if (
    formData.lon &&
    (isNaN(parseFloat(formData.lon)) ||
      parseFloat(formData.lon) < -180 ||
      parseFloat(formData.lon) > 180)
  ) {
    return t('activityModal.invalidLongitude') || 'Longitude must be between -180 and 180';
  }

  return null;
}

export function buildActivityPayload(
  formData: ActivityFormData,
  itinerary_day_id: string | undefined,
): ActivityBasePayload {
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

  const transportDuration =
    formData.transportDurationMinutes.trim() !== ''
      ? parseInt(formData.transportDurationMinutes, 10)
      : undefined;
  const transport_duration_minutes =
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

  return {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
    category: formData.category || undefined,
    itinerary_day_id,
    start_time,
    end_time,
    cost_cents: cost_min_cents,
    cost_min_cents,
    cost_max_cents,
    currency: formData.currency,
    lat: formData.lat ? parseFloat(formData.lat) : undefined,
    lon: formData.lon ? parseFloat(formData.lon) : undefined,
    place_name: formData.placeName.trim() || undefined,
    transport_type: formData.transportType.trim() || undefined,
    transport_notes: formData.transportNotes.trim() || undefined,
    transport_duration_minutes,
    status: formData.status,
    organizer_notes: formData.organizerNotes.trim() || undefined,
  };
}
