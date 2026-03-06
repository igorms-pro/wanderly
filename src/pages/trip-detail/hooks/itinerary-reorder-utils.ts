import type { Activity } from '@/lib/types/database.types';

export function moveActivityWithinDay(
  activitiesByDate: Record<string, Activity[]>,
  date: string,
  activityId: string,
  targetIndex: number,
): Record<string, Activity[]> {
  const dayActivities = activitiesByDate[date] || [];
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
  const sourceActivities = activitiesByDate[sourceDate] || [];
  const targetActivities = activitiesByDate[targetDate] || [];

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
