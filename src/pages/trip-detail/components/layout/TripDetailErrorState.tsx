import type { ComponentProps } from 'react';
import { AlertCircle } from 'lucide-react';
import { DashboardHeader } from '@/pages/dashboard/DashboardHeader';

interface TripDetailErrorStateProps {
  headerProps: ComponentProps<typeof DashboardHeader>;
  title: string;
  errorMessage: string | null;
  backLabel: string;
  retryLabel: string;
  onBack: () => void;
  onRetry: () => void;
}

export function TripDetailErrorState({
  headerProps,
  title,
  errorMessage,
  backLabel,
  retryLabel,
  onBack,
  onRetry,
}: TripDetailErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader {...headerProps} />
      <div className="flex items-center justify-center flex-1 min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          {errorMessage && (
            <p className="text-gray-600 dark:text-gray-300 mb-6" role="status">
              {errorMessage}
            </p>
          )}
          <div className="flex space-x-3 justify-center">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {backLabel}
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              {retryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
