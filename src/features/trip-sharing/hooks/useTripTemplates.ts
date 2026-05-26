import { useCallback, useEffect, useState } from 'react';
import { endDateFromStartAndDuration } from '../lib/shiftTripDates';
import { duplicateTripInApi } from '../services/tripCloneApi';
import {
  createTripFromTemplate,
  deleteTripTemplate,
  fetchMyTripTemplates,
  fetchPublicTripTemplates,
  saveTripAsTemplate,
} from '../services/tripTemplateApi';
import type { TripTemplate } from '../types';
import type { Trip } from '@/lib/types/database.types';

export function useTripTemplates(userId: string | undefined) {
  const [myTemplates, setMyTemplates] = useState<TripTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<TripTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mine, pub] = await Promise.all([
        userId ? fetchMyTripTemplates(userId) : Promise.resolve([]),
        fetchPublicTripTemplates(),
      ]);
      setMyTemplates(mine);
      setPublicTemplates(pub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveTemplate = useCallback(
    async (
      trip: Trip,
      input: { title: string; description?: string; isPublic?: boolean },
    ): Promise<TripTemplate> => {
      if (!userId) throw new Error('User not authenticated');
      const created = await saveTripAsTemplate(userId, trip, input);
      setMyTemplates((prev) => [created, ...prev]);
      if (created.is_public) {
        setPublicTemplates((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
      }
      return created;
    },
    [userId],
  );

  const removeTemplate = useCallback(async (templateId: string) => {
    await deleteTripTemplate(templateId);
    setMyTemplates((prev) => prev.filter((t) => t.id !== templateId));
    setPublicTemplates((prev) => prev.filter((t) => t.id !== templateId));
  }, []);

  const createFromTemplate = useCallback(
    async (template: TripTemplate, title: string, startDate: string): Promise<Trip> => {
      if (!userId) throw new Error('User not authenticated');
      const endDate = endDateFromStartAndDuration(startDate, template.template_data.duration_days);
      return createTripFromTemplate(userId, template, {
        title,
        start_date: startDate,
        end_date: endDate,
      });
    },
    [userId],
  );

  return {
    myTemplates,
    publicTemplates,
    loading,
    error,
    reload,
    saveTemplate,
    removeTemplate,
    createFromTemplate,
  };
}

export function useDuplicateTrip(userId: string | undefined) {
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duplicate = useCallback(
    async (
      sourceTripId: string,
      input: { title: string; start_date: string; end_date: string },
    ): Promise<Trip> => {
      if (!userId) throw new Error('User not authenticated');
      setDuplicating(true);
      setError(null);
      try {
        return await duplicateTripInApi(userId, sourceTripId, input);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to duplicate trip';
        setError(message);
        throw err;
      } finally {
        setDuplicating(false);
      }
    },
    [userId],
  );

  return { duplicate, duplicating, error };
}
