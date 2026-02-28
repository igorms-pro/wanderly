import { differenceInDays, isAfter, isBefore } from 'date-fns';

const CARD_GRADIENTS = [
  'from-rose-500 to-orange-400',
  'from-violet-600 to-indigo-500',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-yellow-400',
  'from-sky-500 to-cyan-400',
  'from-pink-500 to-fuchsia-500',
  'from-lime-500 to-emerald-400',
  'from-orange-500 to-red-500',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getGradient(destination: string): string {
  return CARD_GRADIENTS[hashString(destination) % CARD_GRADIENTS.length];
}

export function getTripTimeLabel(
  startDate: string,
  endDate: string,
  t: (key: string, opts?: Record<string, any>) => string,
): { label: string; color: string } {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isBefore(end, now))
    return { label: t('trip.tripPassed'), color: 'text-stone-400 dark:text-stone-500' };
  if (isBefore(start, now) && isAfter(end, now))
    return { label: t('trip.ongoing'), color: 'text-emerald-600 dark:text-emerald-400' };

  const days = differenceInDays(start, now);
  if (days === 0) return { label: t('trip.today'), color: 'text-violet-600 dark:text-violet-400' };
  if (days === 1)
    return { label: t('trip.tomorrow'), color: 'text-violet-600 dark:text-violet-400' };
  return {
    label: t('trip.daysUntil', { count: days }),
    color: 'text-indigo-600 dark:text-indigo-400',
  };
}

export function formatBudget(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
