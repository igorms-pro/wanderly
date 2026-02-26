import { useEffect, type ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  message: string;
  title?: string;
  onClose: (id: string) => void;
  onDismiss?: () => void;
  duration?: number;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
  },
  info: {
    bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    icon: <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
  },
};

export function Toast({
  id,
  variant,
  message,
  title,
  onClose,
  onDismiss,
  duration = 5000,
}: ToastProps) {
  const { bg, icon } = variantStyles[variant];

  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(() => {
      onClose(id);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(t);
  }, [id, duration, onClose, onDismiss]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bg}`} role="alert">
      <span className="flex-shrink-0 mt-0.5" aria-hidden>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">{title}</p>}
        <p className="text-sm text-stone-700 dark:text-stone-300">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          onClose(id);
          onDismiss?.();
        }}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition text-stone-500 dark:text-stone-400"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
