import type { TFunction } from 'i18next';
import { Cloud, Navigation as NavigationIcon, MessageSquare, Map } from 'lucide-react';

export type Tab = 'itinerary' | 'chat' | 'weather' | 'explore';

function formatUnreadBadgeCount(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

interface TripDetailTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  t: TFunction;
  chatUnreadCount?: number;
}

const TABS: { id: Tab; icon: typeof Map; labelKey: string }[] = [
  { id: 'itinerary', icon: Map, labelKey: 'tripDetail.itinerary' },
  { id: 'weather', icon: Cloud, labelKey: 'tripDetail.weather' },
  { id: 'explore', icon: NavigationIcon, labelKey: 'tripDetail.explore' },
  { id: 'chat', icon: MessageSquare, labelKey: 'tripDetail.chat' },
];

export function TripDetailTabs({
  activeTab,
  onTabChange,
  t,
  chatUnreadCount = 0,
}: TripDetailTabsProps) {
  return (
    <>
      {/* Desktop: horizontal tabs */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-28 sm:top-32 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {TABS.map(({ id, icon: Icon }) => {
              const isActive = activeTab === id;
              const unread = id === 'chat' ? chatUnreadCount : 0;
              const showUnread = unread > 0;
              const badgeText = formatUnreadBadgeCount(unread);
              const ariaLabel =
                id === 'chat' && showUnread
                  ? String(t('tripDetail.chatTabAriaUnread', { display: badgeText }))
                  : String(t(`tripDetail.${id}`));
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange(id)}
                  aria-label={ariaLabel}
                  className={`relative py-4 px-2 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="relative inline-flex shrink-0">
                    <Icon className="w-4 h-4" aria-hidden />
                    {showUnread ? (
                      <span
                        className="absolute -right-2 -top-1 min-h-[16px] min-w-[16px] px-0.5 rounded-full bg-orange-500 text-[10px] font-semibold leading-none text-white flex items-center justify-center tabular-nums"
                        aria-hidden
                      >
                        {badgeText}
                      </span>
                    ) : null}
                  </span>
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
        aria-label={String(t('tripDetail.tabsNavAria'))}
      >
        <div className="max-w-7xl mx-auto px-2 flex justify-around">
          {TABS.map(({ id, icon: Icon, labelKey }) => {
            const isActive = activeTab === id;
            const unread = id === 'chat' ? chatUnreadCount : 0;
            const showUnread = unread > 0;
            const badgeText = formatUnreadBadgeCount(unread);
            const ariaLabel =
              id === 'chat' && showUnread
                ? String(t('tripDetail.chatTabAriaUnread', { display: badgeText }))
                : String(t(labelKey));
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-label={ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-2 px-3 min-h-[56px] min-w-[64px] rounded-lg transition ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                }`}
              >
                <span className="relative inline-flex shrink-0">
                  <Icon className="w-6 h-6" aria-hidden />
                  {showUnread ? (
                    <span
                      className="absolute -right-2 -top-1 min-h-[18px] min-w-[18px] px-0.5 rounded-full bg-orange-500 text-[10px] font-semibold leading-none text-white flex items-center justify-center tabular-nums"
                      aria-hidden
                    >
                      {badgeText}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs font-medium mt-0.5">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
