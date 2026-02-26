import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Toast, type ToastVariant } from '@/components/ui/Toast';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
function nextId() {
  return `toast-${++toastId}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = nextId();
    setToasts((prev) => [...prev, { ...item, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full md:max-w-md"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          variant={t.variant}
          message={t.message}
          title={t.title}
          onClose={removeToast}
          duration={t.duration}
        />
      ))}
    </div>
  );
}

// Hook lives next to provider for co-location; allow export for react-refresh
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
