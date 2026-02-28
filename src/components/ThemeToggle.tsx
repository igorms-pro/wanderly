import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center">
        <Sun className="w-5 h-5 text-gray-700 dark:text-white" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  return (
    <button
      onClick={() => {
        const newTheme = isDark ? 'light' : 'dark';
        setTheme(newTheme);
      }}
      className="w-10 h-10 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/20 transition"
      aria-label={isDark ? t('settings.switchToLight') : t('settings.switchToDark')}
      title={isDark ? t('settings.switchToLight') : t('settings.switchToDark')}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-700 dark:text-white" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 dark:text-white" />
      )}
    </button>
  );
};
