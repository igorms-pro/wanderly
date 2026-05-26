export const TRIP_TIMEZONE_OPTIONS = [
  { value: 'UTC', labelKey: 'sharing.timezones.utc' },
  { value: 'Europe/Paris', labelKey: 'sharing.timezones.paris' },
  { value: 'Europe/London', labelKey: 'sharing.timezones.london' },
  { value: 'America/New_York', labelKey: 'sharing.timezones.newYork' },
  { value: 'America/Los_Angeles', labelKey: 'sharing.timezones.losAngeles' },
  { value: 'America/Chicago', labelKey: 'sharing.timezones.chicago' },
  { value: 'Asia/Tokyo', labelKey: 'sharing.timezones.tokyo' },
  { value: 'Asia/Singapore', labelKey: 'sharing.timezones.singapore' },
  { value: 'Australia/Sydney', labelKey: 'sharing.timezones.sydney' },
  { value: 'Pacific/Auckland', labelKey: 'sharing.timezones.auckland' },
] as const;

export function resolveTripTimezone(value: string | null | undefined): string {
  if (!value) return 'UTC';
  const known = TRIP_TIMEZONE_OPTIONS.some((opt) => opt.value === value);
  return known ? value : 'UTC';
}
