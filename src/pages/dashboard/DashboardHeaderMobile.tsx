import { useTranslation } from 'react-i18next';
import { Menu, X, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export interface DashboardHeaderMobileProps {
  /** Whether the menu panel is open */
  open: boolean;
  /** Toggle open/close (e.g. hamburger click) */
  onToggle: (e: React.MouseEvent) => void;
  /** Close the menu (e.g. after logout) */
  onClose: () => void;
  /** User display name or fallback label */
  displayLabel: string;
  /** Avatar image URL */
  avatarUrl: string;
  /** Called when user taps logout */
  onLogout: () => void;
}

export function DashboardHeaderMobile({
  open,
  onToggle,
  onClose,
  displayLabel,
  avatarUrl,
  onLogout,
}: DashboardHeaderMobileProps) {
  const { t } = useTranslation();

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      <div className="flex md:hidden items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition touch-manipulation active:bg-stone-200 dark:active:bg-stone-700"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-lg rounded-b-xl overflow-hidden md:hidden z-40"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <img
                src={avatarUrl}
                alt={displayLabel}
                className="w-10 h-10 rounded-full ring-2 ring-stone-100 dark:ring-stone-800 object-cover"
              />
              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {displayLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 py-2.5">
              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {t('common.language')}
              </span>
              <LanguageSwitcher variant="dropdown" size="sm" />
            </div>
            <div className="flex items-center gap-2 py-2.5">
              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {t('settings.theme')}
              </span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 py-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition text-left"
            >
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {t('auth.signOut')}
              </span>
              <LogOut className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
