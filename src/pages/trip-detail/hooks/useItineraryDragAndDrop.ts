import { useCallback, useState } from 'react';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';
import { moveActivityWithinDay, moveActivityToOtherDay } from './itinerary-reorder-utils';

interface UseItineraryDragAndDropArgs {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
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
    },
    [canEdit],
  );

  const persistReorder = useCallback(
    async (activityId: string, newDate: string) => {
      const all = Object.values(activitiesByDate).flat();
      const activity = all.find((a) => a.id === activityId);
      if (!activity) return;
      await updateActivity(activityId, {
        itinerary_day_id: activity.itinerary_day_id,
        start_time: activity.start_time,
        // In future we might store explicit order per day.
      });
    },
    [activitiesByDate, updateActivity],
  );

  const handleDropOnActivity = useCallback(
    async (targetActivityId: string, targetDate: string, targetIndex: number) => {
      if (!canEdit || !draggingActivityId || !draggingDate) return;
      const sameDay = draggingDate === targetDate;

      const nextByDate = sameDay
        ? moveActivityWithinDay(activitiesByDate, targetDate, draggingActivityId, targetIndex)
        : moveActivityToOtherDay(
            activitiesByDate,
            draggingDate,
            targetDate,
            draggingActivityId,
            targetIndex,
          );

      setActivities(Object.values(nextByDate).flat());
      await persistReorder(draggingActivityId, targetDate);
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [activitiesByDate, canEdit, draggingActivityId, draggingDate, persistReorder, setActivities],
  );

  const handleDropOnEmptyDay = useCallback(
    async (targetDate: string) => {
      if (!canEdit || !draggingActivityId || !draggingDate) return;

      const nextByDate = moveActivityToOtherDay(
        activitiesByDate,
        draggingDate,
        targetDate,
        draggingActivityId,
        0,
      );

      setActivities(Object.values(nextByDate).flat());
      await persistReorder(draggingActivityId, targetDate);
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [activitiesByDate, canEdit, draggingActivityId, draggingDate, persistReorder, setActivities],
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
