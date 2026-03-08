import { Cloud, Navigation as NavigationIcon, MessageSquare, Map } from 'lucide-react';

export type Tab = 'itinerary' | 'chat' | 'weather' | 'explore';

interface TripDetailTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  t: (key: string) => string;
}

const TABS: { id: Tab; icon: typeof Map; labelKey: string }[] = [
  { id: 'itinerary', icon: Map, labelKey: 'tripDetail.itinerary' },
  { id: 'weather', icon: Cloud, labelKey: 'tripDetail.weather' },
  { id: 'explore', icon: NavigationIcon, labelKey: 'tripDetail.explore' },
  { id: 'chat', icon: MessageSquare, labelKey: 'tripDetail.chat' },
];

export function TripDetailTabs({ activeTab, onTabChange, t }: TripDetailTabsProps) {
  return (
    <>
      {/* Desktop: horizontal tabs */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-28 sm:top-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {TABS.map(({ id, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(`tripDetail.${id}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: bottom dock (icons + labels) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)]"
        aria-label="Trip tabs"
      >
        <div className="max-w-7xl mx-auto px-2 flex justify-around">
          {TABS.map(({ id, icon: Icon, labelKey }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center justify-center py-2 px-3 min-h-[56px] min-w-[64px] rounded-lg transition ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-6 h-6 flex-shrink-0" aria-hidden />
                <span className="text-xs font-medium mt-0.5">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
