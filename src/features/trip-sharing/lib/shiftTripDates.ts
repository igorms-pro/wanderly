/** Add days to an ISO date string (YYYY-MM-DD). */
export function addDaysToIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Inclusive day count between two ISO dates. */
export function tripDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  const diff = Math.round((end - start) / (24 * 60 * 60 * 1000));
  return Math.max(1, diff + 1);
}

/** Map each source trip date to a target date using a new start anchor. */
export function buildDateShiftMap(
  sourceStartDate: string,
  targetStartDate: string,
  sourceDates: string[],
): Record<string, string> {
  const offsetDays = Math.round(
    (new Date(`${targetStartDate}T00:00:00Z`).getTime() -
      new Date(`${sourceStartDate}T00:00:00Z`).getTime()) /
      (24 * 60 * 60 * 1000),
  );

  return sourceDates.reduce<Record<string, string>>((acc, date) => {
    acc[date] = addDaysToIsoDate(date, offsetDays);
    return acc;
  }, {});
}

export function endDateFromStartAndDuration(startDate: string, durationDays: number): string {
  return addDaysToIsoDate(startDate, durationDays - 1);
}
