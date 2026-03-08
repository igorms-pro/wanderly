import type { Activity } from '@/lib/types/database.types';

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
