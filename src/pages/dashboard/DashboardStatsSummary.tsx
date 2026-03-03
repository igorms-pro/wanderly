import { useMemo } from 'react';
import type { Trip } from '@/lib/types/database.types';
import { TripStats } from '@/features/trips';

export interface DashboardStatsSummaryProps {
  trips: Trip[];
}

export function DashboardStatsSummary({ trips }: DashboardStatsSummaryProps) {
  const statsTrips = useMemo(() => trips, [trips]);

  if (statsTrips.length === 0) return null;

  return <TripStats trips={statsTrips} />;
}
