import type { ReactNode } from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Optional icon or illustration */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Primary action (e.g. "Create trip") */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`.trim()}
    >
      {icon && (
        <div className="mb-4 text-orange-500 dark:text-orange-400" aria-hidden>
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">{title}</h3>
      {description && (
        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
