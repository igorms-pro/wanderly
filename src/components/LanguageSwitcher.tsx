import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
}) => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const { t, ready } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const flagEmojis = {
    en: '🇬🇧',
    fr: '🇫🇷',
    es: '🇪🇸',
    pt: '🇵🇹',
    'pt-BR': '🇧🇷',
    ja: '🇯🇵',
    zh: '🇨🇳',
    de: '🇩🇪',
    it: '🇮🇹',
    ru: '🇷🇺',
  };

  const languageNames = {
    en: 'EN',
    fr: 'FR',
    es: 'ES',
    pt: 'PT',
    'pt-BR': 'BR',
    ja: 'JP',
    zh: 'CN',
    de: 'DE',
    it: 'IT',
    ru: 'RU',
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!ready) {
    return (
      <div
        className={`${sizeClasses[size]} bg-white dark:bg-white/10 rounded-lg flex items-center justify-center`}
      >
        <span className="text-xs">...</span>
      </div>
    );
  }

  const handleLanguageChange = (
    language: 'en' | 'fr' | 'es' | 'pt' | 'pt-BR' | 'ja' | 'zh' | 'de' | 'it' | 'ru',
  ) => {
    // TEMP: debug language switcher

    console.log('[LanguageSwitcher] changeLanguage →', language);
    changeLanguage(language);
    setIsOpen(false);
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${sizeClasses[size]} bg-white dark:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/20 transition`}
          aria-label={t('settings.languageSelection')}
          aria-expanded={isOpen}
        >
          <span className="text-lg">{flagEmojis[currentLanguage as keyof typeof flagEmojis]}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-xl z-50 min-w-[120px]">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                  currentLanguage === lang
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                <span className="text-lg">{flagEmojis[lang as keyof typeof flagEmojis]}</span>
                <span className="font-medium">
                  {languageNames[lang as keyof typeof languageNames]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Button variant (cycle through languages)
  const allLanguages = ['en', 'fr', 'es', 'pt', 'pt-BR', 'ja', 'zh', 'de', 'it', 'ru'] as const;
  const currentIndex = allLanguages.indexOf(currentLanguage as (typeof allLanguages)[number]);
  const nextLanguage = allLanguages[(currentIndex + 1) % allLanguages.length];

  return (
    <button
      onClick={() => changeLanguage(nextLanguage)}
      className={`${sizeClasses[size]} bg-white dark:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-white/20 transition`}
      aria-label={t('settings.languageSelection')}
      title={t('settings.languageSelection')}
    >
      <span className="text-lg">{flagEmojis[currentLanguage as keyof typeof flagEmojis]}</span>
    </button>
  );
};
