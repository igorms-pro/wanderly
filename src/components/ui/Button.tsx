import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'accent'
  | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 focus:ring-orange-500 dark:bg-orange-400 dark:hover:bg-orange-500 dark:active:bg-orange-600',
  secondary:
    'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-800/40',
  ghost:
    'bg-transparent text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/30',
  outline:
    'bg-transparent border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/30',
  accent:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 focus:ring-rose-500 dark:bg-rose-400 dark:hover:bg-rose-500',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-900 disabled:opacity-50 disabled:cursor-not-allowed';
    const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    return (
      <button ref={ref} type={type} className={classes} disabled={disabled ?? loading} {...props}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
