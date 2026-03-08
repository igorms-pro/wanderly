import { useCallback, useState } from 'react';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';
import { moveActivityWithinDay, moveActivityToOtherDay } from './itinerary-reorder-utils';

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

  const persistReorder = useCallback(
    async (
      activityId: string,
      newDate: string,
      newOrderedIdsForDay?: string[],
      isSameDay?: boolean,
    ) => {
      const targetDayId = itineraryDayIdByDate[newDate];
      if (!targetDayId) return;

      if (newOrderedIdsForDay != null && newOrderedIdsForDay.length > 0) {
        for (let i = 0; i < newOrderedIdsForDay.length; i++) {
          const id = newOrderedIdsForDay[i];
          const updates: { order_index: number; itinerary_day_id?: string } = { order_index: i };
          if (!isSameDay && id === activityId) {
            updates.itinerary_day_id = targetDayId;
          }
          await updateActivity(id, updates);
        }
        return;
      }

      const all = sortedDates.flatMap((d) => activitiesByDate[d] ?? []);
      const activity = all.find((a) => a.id === activityId);
      if (!activity) return;
      if (activity.itinerary_day_id === targetDayId) return;
      await updateActivity(activityId, { itinerary_day_id: targetDayId });
    },
    [activitiesByDate, itineraryDayIdByDate, sortedDates, updateActivity],
  );

  const handleDropOnActivity = useCallback(
    async (targetActivityId: string, targetDate: string, targetIndex: number) => {
      if (import.meta.env.DEV) {
        console.log('[DnD] handleDropOnActivity called', {
          targetActivityId,
          targetDate,
          targetIndex,
          canEdit,
          draggingActivityId,
          draggingDate,
        });
      }
      if (!canEdit || !draggingActivityId || !draggingDate) {
        if (import.meta.env.DEV) {
          console.log('[DnD] handleDropOnActivity skipped (missing canEdit or dragging state)');
        }
        return;
      }
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
        const targetDayId = itineraryDayIdByDate[targetDate];
        const targetList = nextByDate[targetDate] ?? [];
        const movedIndex = targetList.findIndex((a) => a.id === draggingActivityId);
        if (movedIndex !== -1 && targetDayId) {
          const moved = targetList[movedIndex];
          const patched = [...targetList];
          patched[movedIndex] = { ...moved, itinerary_day_id: targetDayId };
          nextByDate = { ...nextByDate, [targetDate]: patched };
        }
      }

      const flat = sortedDates.flatMap((d) => nextByDate[d] ?? []);
      const newOrderForDay = (nextByDate[targetDate] ?? []).map((a) => a.id);
      if (import.meta.env.DEV) {
        console.log('[DnD] handleDropOnActivity applying', {
          sameDay,
          flatCount: flat.length,
          targetDate,
          newOrderForDay,
        });
      }
      setActivities(flat);
      if (import.meta.env.DEV) {
        const after = useStore.getState().activities;
        const afterIds = after.map((a) => a.id);
        console.log('[DnD] store.activities after set', {
          count: after.length,
          firstIds: afterIds.slice(0, 5),
        });
      }
      await persistReorder(
        draggingActivityId,
        targetDate,
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
      persistReorder,
      setActivities,
      sortedDates,
    ],
  );

  const handleDropOnEmptyDay = useCallback(
    async (targetDate: string) => {
      if (import.meta.env.DEV) {
        console.log('[DnD] handleDropOnEmptyDay', {
          targetDate,
          canEdit,
          draggingActivityId,
          draggingDate,
        });
      }
      if (!canEdit || !draggingActivityId || !draggingDate) return;

      let nextByDate = moveActivityToOtherDay(
        activitiesByDate,
        draggingDate,
        targetDate,
        draggingActivityId,
        0,
      );

      const targetDayId = itineraryDayIdByDate[targetDate];
      const targetList = nextByDate[targetDate] ?? [];
      const movedIndex = targetList.findIndex((a) => a.id === draggingActivityId);
      if (movedIndex !== -1 && targetDayId) {
        const moved = targetList[movedIndex];
        const patched = [...targetList];
        patched[movedIndex] = { ...moved, itinerary_day_id: targetDayId };
        nextByDate = { ...nextByDate, [targetDate]: patched };
      }

      const flat = sortedDates.flatMap((d) => nextByDate[d] ?? []);
      const newOrderForDay = (nextByDate[targetDate] ?? []).map((a) => a.id);
      setActivities(flat);
      await persistReorder(
        draggingActivityId,
        targetDate,
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
