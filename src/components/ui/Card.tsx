import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'interactive' | 'elevated';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md',
  interactive:
    'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-md hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 cursor-pointer transition',
  elevated:
    'bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-stone-800 border border-orange-200 dark:border-orange-800 shadow-lg',
};

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const classes = `rounded-xl p-6 ${variantClasses[variant]} ${className}`.trim();
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`.trim()}>
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
        {subtitle && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
