import type { ComponentProps } from 'react';
import { DashboardHeader } from '@/pages/dashboard/DashboardHeader';

interface TripDetailLoadingStateProps {
  headerProps: ComponentProps<typeof DashboardHeader>;
  message: string;
}

export function TripDetailLoadingState({ headerProps, message }: TripDetailLoadingStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader {...headerProps} />
      <div className="flex items-center justify-center flex-1 min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      </div>
    </div>
  );
}
