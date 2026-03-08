import { useCallback, useState } from 'react';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';

import {
  commitDrop,
  moveActivityToOtherDay,
  moveActivityWithinDay,
  patchMovedActivityDayId,
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
    async (_targetActivityId: string, targetDate: string, targetIndex: number) => {
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

      await commitDrop(
        nextByDate,
        draggingActivityId,
        targetDate,
        sortedDates,
        activitiesByDate,
        itineraryDayIdByDate,
        sameDay,
        setActivities,
        updateActivity,
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
      if (!canEdit || !draggingActivityId || !draggingDate) return;

      const nextByDate = patchMovedActivityDayId(
        moveActivityToOtherDay(activitiesByDate, draggingDate, targetDate, draggingActivityId, 0),
        targetDate,
        draggingActivityId,
        itineraryDayIdByDate,
      );

      await commitDrop(
        nextByDate,
        draggingActivityId,
        targetDate,
        sortedDates,
        activitiesByDate,
        itineraryDayIdByDate,
        false,
        setActivities,
        updateActivity,
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
