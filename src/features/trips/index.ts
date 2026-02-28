/**
 * Trips feature – public API.
 * Import from '@/features/trips' only; do not reach into internal paths.
 */

export { default as CreateTripModal } from './components/CreateTripModal';
export { default as TripCard } from './components/TripCard';
export { default as TripStats } from './components/TripStats';
export { default as DashboardHero } from './components/DashboardHero';
export { getGradient, getTripTimeLabel, formatBudget } from './utils/trip-helpers';
