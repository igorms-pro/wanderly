import { useTranslation } from 'react-i18next';
import { Plane, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { User } from '@/lib/mock-supabase';

export interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200/50 dark:border-stone-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">Voyagely</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="dropdown" size="md" />
            <ThemeToggle />
            <div className="h-6 w-px bg-stone-200 dark:bg-stone-700" />
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar_url}
                alt={user?.display_name}
                className="w-8 h-8 rounded-full ring-2 ring-stone-100 dark:ring-stone-800"
              />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300 hidden sm:block">
                {user?.display_name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title={t('auth.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
