import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plane, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardHeaderMobile } from './DashboardHeaderMobile';
import type { User } from '@/lib/types/database.types';

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
            <Link
              to="/account"
              className="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded-md px-1"
            >
              {t('account.title')}
            </Link>
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

          {/* Mobile: hamburger + menu */}
          <DashboardHeaderMobile
            open={mobileMenuOpen}
            onToggle={handleToggleMenu}
            onClose={() => setMobileMenuOpen(false)}
            displayLabel={displayLabel}
            avatarUrl={avatarUrl}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
