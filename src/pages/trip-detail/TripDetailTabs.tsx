import { Cloud, Navigation as NavigationIcon, MessageSquare } from 'lucide-react';

type Tab = 'itinerary' | 'chat' | 'weather' | 'explore';

interface TripDetailTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  t: (key: string) => string;
}

export function TripDetailTabs({ activeTab, onTabChange, t }: TripDetailTabsProps) {
  const tabClass = (tab: Tab) =>
    `py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
      activeTab === tab
        ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
    }`;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          <button onClick={() => onTabChange('itinerary')} className={tabClass('itinerary')}>
            {t('tripDetail.itinerary')}
          </button>
          <button onClick={() => onTabChange('weather')} className={tabClass('weather')}>
            <Cloud className="w-4 h-4 inline mr-2" />
            {t('tripDetail.weather')}
          </button>
          <button onClick={() => onTabChange('explore')} className={tabClass('explore')}>
            <NavigationIcon className="w-4 h-4 inline mr-2" />
            {t('tripDetail.explore')}
          </button>
          <button onClick={() => onTabChange('chat')} className={tabClass('chat')}>
            <MessageSquare className="w-4 h-4 inline mr-2" />
            {t('tripDetail.chat')}
          </button>
        </div>
      </div>
    </div>
  );
}
