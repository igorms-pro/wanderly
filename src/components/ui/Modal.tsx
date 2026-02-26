import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Close when clicking backdrop (default true) */
  closeOnBackdrop?: boolean;
  /** Show close button in header (default true) */
  showCloseButton?: boolean;
  /** Optional footer actions (e.g. Cancel / Submit) */
  footer?: ReactNode;
  /** Optional class for the content panel */
  contentClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  showCloseButton = true,
  footer,
  contentClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`bg-white dark:bg-stone-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col w-full max-w-lg ${contentClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-stone-900 dark:text-stone-100"
              >
                {title}
              </h2>
            )}
            <div className={title ? '' : 'ml-auto'}>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-stone-200 dark:border-stone-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
