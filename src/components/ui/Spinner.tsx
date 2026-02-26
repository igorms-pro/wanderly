import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-orange-500 dark:text-orange-400 ${sizeClasses[size]} ${className}`.trim()}
      aria-hidden={false}
      aria-label={ariaLabel}
    />
  );
}
