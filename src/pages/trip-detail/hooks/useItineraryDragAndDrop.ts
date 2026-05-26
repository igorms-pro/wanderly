import { useCallback, useState } from 'react';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';

import { commitDrop, computeNextByDateForDrop } from './itinerary-reorder-utils';

interface UseItineraryDragAndDropArgs {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
  itineraryDayIdByDate: Record<string, string>;
  canEdit: boolean;
}

export interface UseItineraryDragAndDropResult {
  draggingActivityId: string | null;
  draggingDate: string | null;
  handleDragStart: (activityId: string, date: string) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDropOnActivity: (
    targetActivityId: string,
    targetDate: string,
    targetIndex: number,
  ) => Promise<void>;
  handleDropOnEmptyDay: (targetDate: string) => Promise<void>;
}

export function useItineraryDragAndDrop({
  activitiesByDate,
  sortedDates,
  itineraryDayIdByDate,
  canEdit,
}: UseItineraryDragAndDropArgs): UseItineraryDragAndDropResult {
  const [draggingActivityId, setDraggingActivityId] = useState<string | null>(null);
  const [draggingDate, setDraggingDate] = useState<string | null>(null);
  const setActivities = useStore((s) => s.setActivities);
  const updateActivity = useStore((s) => s.updateActivity);

  const handleDragStart = useCallback(
    (activityId: string, date: string) => {
      if (!canEdit) return;
      setDraggingActivityId(activityId);
      setDraggingDate(date);
    },
    [canEdit],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!canEdit) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    [canEdit],
  );

  const performDrop = useCallback(
    async (
      nextByDate: Record<string, Activity[]>,
      activityId: string,
      targetDate: string,
      isSameDay: boolean,
    ) => {
      await commitDrop(
        nextByDate,
        activityId,
        targetDate,
        sortedDates,
        activitiesByDate,
        itineraryDayIdByDate,
        isSameDay,
        setActivities,
        updateActivity,
      );
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [activitiesByDate, itineraryDayIdByDate, setActivities, sortedDates, updateActivity],
  );

  const handleDropOnActivity = useCallback(
    async (_targetActivityId: string, targetDate: string, targetIndex: number) => {
      if (!canEdit || !draggingActivityId || !draggingDate) return;
      const { nextByDate, sameDay } = computeNextByDateForDrop(
        activitiesByDate,
        draggingDate,
        targetDate,
        draggingActivityId,
        targetIndex,
        itineraryDayIdByDate,
      );
      await performDrop(nextByDate, draggingActivityId, targetDate, sameDay);
    },
    [
      activitiesByDate,
      canEdit,
      draggingActivityId,
      draggingDate,
      itineraryDayIdByDate,
      performDrop,
    ],
  );

  const handleDropOnEmptyDay = useCallback(
    async (targetDate: string) => {
      if (!canEdit || !draggingActivityId || !draggingDate) return;
      const { nextByDate } = computeNextByDateForDrop(
        activitiesByDate,
        draggingDate,
        targetDate,
        draggingActivityId,
        0,
        itineraryDayIdByDate,
      );
      await performDrop(nextByDate, draggingActivityId, targetDate, false);
    },
    [
      activitiesByDate,
      canEdit,
      draggingActivityId,
      draggingDate,
      itineraryDayIdByDate,
      performDrop,
    ],
  );

  return {
    draggingActivityId,
    draggingDate,
    handleDragStart,
    handleDragOver,
    handleDropOnActivity,
    handleDropOnEmptyDay,
  };
}
