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
      const all = sortedDates.flatMap((d) => activitiesByDate[d] ?? []);
      const activity = all.find((a) => a.id === activityId);
      if (!activity) return;
      const currentDate = activity.start_time?.includes('T')
        ? activity.start_time.split('T')[0]
        : activity.created_at.split('T')[0];
      if (currentDate === newDate) return; // Same day: order not persisted yet (no order field).
      const timePart = activity.start_time?.includes('T')
        ? (activity.start_time.split('T')[1] ?? '10:00:00')
        : '10:00:00';
      const newStartTime = `${newDate}T${timePart}`;
      await updateActivity(activityId, { start_time: newStartTime });
    },
    [activitiesByDate, sortedDates, updateActivity],
  );

  const handleDropOnActivity = useCallback(
    async (targetActivityId: string, targetDate: string, targetIndex: number) => {
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
        const targetList = nextByDate[targetDate] ?? [];
        const movedIndex = targetList.findIndex((a) => a.id === draggingActivityId);
        if (movedIndex !== -1) {
          const moved = targetList[movedIndex];
          const timePart = moved.start_time?.includes('T')
            ? (moved.start_time.split('T')[1] ?? '10:00:00')
            : '10:00:00';
          const newStartTime = `${targetDate}T${timePart}`;
          const patched = [...targetList];
          patched[movedIndex] = { ...moved, start_time: newStartTime };
          nextByDate = { ...nextByDate, [targetDate]: patched };
        }
      }

      const flat = sortedDates.flatMap((d) => nextByDate[d] ?? []);
      setActivities(flat);
      await persistReorder(draggingActivityId, targetDate);
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [
      activitiesByDate,
      canEdit,
      draggingActivityId,
      draggingDate,
      persistReorder,
      setActivities,
      sortedDates,
    ],
  );

  const handleDropOnEmptyDay = useCallback(
    async (targetDate: string) => {
      if (!canEdit || !draggingActivityId || !draggingDate) return;

      let nextByDate = moveActivityToOtherDay(
        activitiesByDate,
        draggingDate,
        targetDate,
        draggingActivityId,
        0,
      );

      const targetList = nextByDate[targetDate] ?? [];
      const movedIndex = targetList.findIndex((a) => a.id === draggingActivityId);
      if (movedIndex !== -1) {
        const moved = targetList[movedIndex];
        const timePart = moved.start_time?.includes('T')
          ? (moved.start_time.split('T')[1] ?? '10:00:00')
          : '10:00:00';
        const newStartTime = `${targetDate}T${timePart}`;
        const patched = [...targetList];
        patched[movedIndex] = { ...moved, start_time: newStartTime };
        nextByDate = { ...nextByDate, [targetDate]: patched };
      }

      const flat = sortedDates.flatMap((d) => nextByDate[d] ?? []);
      setActivities(flat);
      await persistReorder(draggingActivityId, targetDate);
      setDraggingActivityId(null);
      setDraggingDate(null);
    },
    [
      activitiesByDate,
      canEdit,
      draggingActivityId,
      draggingDate,
      persistReorder,
      setActivities,
      sortedDates,
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
