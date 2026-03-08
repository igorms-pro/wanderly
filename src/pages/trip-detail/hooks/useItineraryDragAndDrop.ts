import { useCallback, useState } from 'react';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';

import {
  moveActivityToOtherDay,
  moveActivityWithinDay,
  patchMovedActivityDayId,
  persistReorder,
} from './itinerary-reorder-utils';

interface UseItineraryDragAndDropArgs {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
  itineraryDayIdByDate: Record<string, string>;
  canEdit: boolean;
}

interface UseItineraryDragAndDropResult {
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
      if (import.meta.env.DEV) {
        console.log('[DnD] handleDragStart', { activityId, date, canEdit });
      }
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

  const handleDropOnActivity = useCallback(
    async (targetActivityId: string, targetDate: string, targetIndex: number) => {
      if (import.meta.env.DEV) {
        console.log('[DnD] handleDropOnActivity called', {
          targetActivityId,
          targetDate,
          targetIndex,
          draggingActivityId,
          draggingDate,
        });
      }
      if (!canEdit || !draggingActivityId || !draggingDate) return;

      const sameDay = draggingDate === targetDate;
      let nextByDate = sameDay
        ? moveActivityWithinDay(activitiesByDate, targetDate, draggingActivityId, targetIndex)
        : moveActivityToOtherDay(
            activitiesByDate,
            draggingDate,
            targetDate,
            draggingActivityId,
            targetIndex,
          );

      if (!sameDay) {
        nextByDate = patchMovedActivityDayId(
          nextByDate,
          targetDate,
          draggingActivityId,
          itineraryDayIdByDate,
        );
      }

      const flat = sortedDates.flatMap((d) => nextByDate[d] ?? []);
      const newOrderForDay = (nextByDate[targetDate] ?? []).map((a) => a.id);
      setActivities(flat);

      await persistReorder(
        draggingActivityId,
        targetDate,
        itineraryDayIdByDate,
        activitiesByDate,
        sortedDates,
        updateActivity,
        newOrderForDay.length > 0 ? newOrderForDay : undefined,
        sameDay,
      );
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [
      activitiesByDate,
      canEdit,
      draggingActivityId,
      draggingDate,
      itineraryDayIdByDate,
      setActivities,
      sortedDates,
      updateActivity,
    ],
  );

  const handleDropOnEmptyDay = useCallback(
    async (targetDate: string) => {
      if (import.meta.env.DEV) {
        console.log('[DnD] handleDropOnEmptyDay', { targetDate, draggingActivityId, draggingDate });
      }
      if (!canEdit || !draggingActivityId || !draggingDate) return;

      let nextByDate = moveActivityToOtherDay(
        activitiesByDate,
        draggingDate,
        targetDate,
        draggingActivityId,
        0,
      );
      nextByDate = patchMovedActivityDayId(
        nextByDate,
        targetDate,
        draggingActivityId,
        itineraryDayIdByDate,
      );

      const flat = sortedDates.flatMap((d) => nextByDate[d] ?? []);
      const newOrderForDay = (nextByDate[targetDate] ?? []).map((a) => a.id);
      setActivities(flat);

      await persistReorder(
        draggingActivityId,
        targetDate,
        itineraryDayIdByDate,
        activitiesByDate,
        sortedDates,
        updateActivity,
        newOrderForDay.length > 0 ? newOrderForDay : undefined,
        false,
      );
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [
      activitiesByDate,
      canEdit,
      draggingActivityId,
      draggingDate,
      itineraryDayIdByDate,
      setActivities,
      sortedDates,
      updateActivity,
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
