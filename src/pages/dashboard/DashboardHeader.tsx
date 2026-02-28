import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, LogOut, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { User } from '@/lib/mock-supabase';

export interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

const PLACEHOLDER_NAMES = ['test user', 'user', ''];

function getDisplayLabel(user: User | null, fallback: string): string {
  if (!user) return fallback;
  const name = (user.display_name || '').trim();
  if (!name || PLACEHOLDER_NAMES.includes(name.toLowerCase())) {
    const fromEmail = user.email?.split('@')[0];
    return fromEmail || fallback;
  }
  return name;
}

function getAvatarUrl(user: User | null): string {
  if (!user?.avatar_url) {
    const seed = user?.id || user?.email || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }
  return user.avatar_url;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayLabel = getDisplayLabel(user, t('auth.myAccount'));
  const avatarUrl = getAvatarUrl(user);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    const id = setTimeout(() => document.addEventListener('click', close), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', close);
    };
  }, [mobileMenuOpen]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen((o) => !o);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={menuRef}>
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
              Voyagely
            </span>
          </div>

          {/* Desktop: lang, theme, user, logout */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant="dropdown" size="md" />
            <ThemeToggle />
            <div className="h-6 w-px bg-stone-200 dark:bg-stone-700" />
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={avatarUrl}
                alt={displayLabel}
                className="w-8 h-8 rounded-full ring-2 ring-stone-100 dark:ring-stone-800 flex-shrink-0 object-cover"
              />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate max-w-[120px]">
                {displayLabel}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition flex-shrink-0"
              title={t('auth.signOut')}
              aria-label={t('auth.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={(e) => handleToggleMenu(e)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition touch-manipulation active:bg-stone-200 dark:active:bg-stone-700"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown: full width under header */}
        {mobileMenuOpen && (
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
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {t('common.language')}
                </span>
                <LanguageSwitcher variant="dropdown" size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {t('settings.theme')}
                </span>
                <ThemeToggle />
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.signOut')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
