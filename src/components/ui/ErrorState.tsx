import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Optional icon (default: AlertCircle) */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Retry button label (e.g. "Try again") */
  retryLabel?: string;
  onRetry?: () => void;
  /** Optional secondary action */
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
}

export function ErrorState({
  icon,
  title,
  description,
  retryLabel = 'Try again',
  onRetry,
  secondaryLabel,
  onSecondary,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`.trim()}
      role="alert"
    >
      <div className="mb-4 text-red-500 dark:text-red-400" aria-hidden>
        {icon ?? <AlertCircle className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">{title}</h3>
      {description && (
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button variant="outline" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
