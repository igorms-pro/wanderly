import type { Activity } from '@/lib/types/database.types';

type ActivityReorderUpdate = { order_index?: number; itinerary_day_id?: string };

/** Sort activities by order_index (persisted drag order), then start_time, then created_at. */
function sortByDayOrder(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const orderA = a.order_index ?? Infinity;
    const orderB = b.order_index ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    const timeCmp = (a.start_time || '').localeCompare(b.start_time || '');
    if (timeCmp !== 0) return timeCmp;
    return (a.created_at || '').localeCompare(b.created_at || '');
  });
}

export function moveActivityWithinDay(
  activitiesByDate: Record<string, Activity[]>,
  date: string,
  activityId: string,
  targetIndex: number,
): Record<string, Activity[]> {
  const dayActivities = sortByDayOrder(activitiesByDate[date] || []);
  const currentIndex = dayActivities.findIndex((a) => a.id === activityId);
  if (currentIndex === -1 || currentIndex === targetIndex) return activitiesByDate;

  const nextDayActivities = [...dayActivities];
  const [moved] = nextDayActivities.splice(currentIndex, 1);
  nextDayActivities.splice(targetIndex, 0, moved);

  return {
    ...activitiesByDate,
    [date]: nextDayActivities,
  };
}

export function moveActivityToOtherDay(
  activitiesByDate: Record<string, Activity[]>,
  sourceDate: string,
  targetDate: string,
  activityId: string,
  targetIndex: number,
): Record<string, Activity[]> {
  const sourceActivities = sortByDayOrder(activitiesByDate[sourceDate] || []);
  const targetActivities = sortByDayOrder(activitiesByDate[targetDate] || []);

  const currentIndex = sourceActivities.findIndex((a) => a.id === activityId);
  if (currentIndex === -1) return activitiesByDate;

  const nextSource = [...sourceActivities];
  const [moved] = nextSource.splice(currentIndex, 1);

  const nextTarget = [...targetActivities];
  const insertIndex = Math.max(0, Math.min(targetIndex, nextTarget.length));
  nextTarget.splice(insertIndex, 0, moved);

  return {
    ...activitiesByDate,
    [sourceDate]: nextSource,
    [targetDate]: nextTarget,
  };
}

/**
 * Patches the moved activity's `itinerary_day_id` in the optimistic state
 * when moving across days, so the local state matches what will be persisted.
 */
export function patchMovedActivityDayId(
  nextByDate: Record<string, Activity[]>,
  targetDate: string,
  activityId: string,
  itineraryDayIdByDate: Record<string, string>,
): Record<string, Activity[]> {
  const targetDayId = itineraryDayIdByDate[targetDate];
  const targetList = nextByDate[targetDate] ?? [];
  const movedIndex = targetList.findIndex((a) => a.id === activityId);
  if (movedIndex === -1 || !targetDayId) return nextByDate;
  const patched = [...targetList];
  patched[movedIndex] = { ...patched[movedIndex], itinerary_day_id: targetDayId };
  return { ...nextByDate, [targetDate]: patched };
}

/**
 * Persists a drag-and-drop reorder to the database by updating
 * `order_index` (and optionally `itinerary_day_id`) for each activity.
 */
export async function persistReorder(
  activityId: string,
  newDate: string,
  itineraryDayIdByDate: Record<string, string>,
  activitiesByDate: Record<string, Activity[]>,
  sortedDates: string[],
  updateActivity: (id: string, updates: ActivityReorderUpdate) => Promise<void>,
  newOrderedIdsForDay?: string[],
  isSameDay?: boolean,
): Promise<void> {
  const targetDayId = itineraryDayIdByDate[newDate];
  if (!targetDayId) return;

  if (newOrderedIdsForDay != null && newOrderedIdsForDay.length > 0) {
    for (let i = 0; i < newOrderedIdsForDay.length; i++) {
      const id = newOrderedIdsForDay[i];
      const updates: ActivityReorderUpdate = { order_index: i };
      if (!isSameDay && id === activityId) {
        updates.itinerary_day_id = targetDayId;
      }
      await updateActivity(id, updates);
    }
    return;
  }

  const all = sortedDates.flatMap((d) => activitiesByDate[d] ?? []);
  const activity = all.find((a) => a.id === activityId);
  if (!activity || activity.itinerary_day_id === targetDayId) return;
  await updateActivity(activityId, { itinerary_day_id: targetDayId });
}
