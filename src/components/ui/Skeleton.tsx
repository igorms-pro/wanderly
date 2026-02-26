import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional: number of lines for text skeleton (height varies per line) */
  lines?: number;
}

export function Skeleton({ className = '', lines, ...props }: SkeletonProps) {
  if (lines != null && lines > 0) {
    return (
      <div className={`space-y-2 ${className}`.trim()} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-stone-200 dark:bg-stone-700 animate-pulse"
            style={{ width: i === lines - 1 && lines > 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`rounded bg-stone-200 dark:bg-stone-700 animate-pulse ${className}`.trim()}
      {...props}
    />
  );
}

/** Skeleton shaped like a card (e.g. trip card). */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-stone-200 dark:border-stone-700 p-6 ${className}`.trim()}
    >
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton lines={2} />
    </div>
  );
}
