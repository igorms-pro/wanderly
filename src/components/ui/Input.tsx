import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const baseClasses =
  'w-full px-4 py-3 rounded-lg border bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed';
const borderDefault = 'border-stone-300 dark:border-stone-600';
const borderError = 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id: idProp, ...props }, ref) => {
    const id = idProp ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const borderClass = error ? borderError : borderDefault;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`${baseClasses} ${borderClass} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
