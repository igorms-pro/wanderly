import { useTranslation } from 'react-i18next';

export function TripChatHeader() {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">{t('chat.tripChatTitle')}</h3>
      <p className="text-sm text-gray-600">{t('chat.tripChatSubtitle')}</p>
    </div>
  );
}
