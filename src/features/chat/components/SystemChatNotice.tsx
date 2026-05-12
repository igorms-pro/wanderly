import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { TripSystemPayload } from '@/lib/trip-system-chat';

interface SystemChatNoticeProps {
  payload: TripSystemPayload;
}

export function SystemChatNotice({ payload }: SystemChatNoticeProps) {
  const { t } = useTranslation();

  let text: string;
  if (payload.kind === 'trip_finalized') {
    text = t('tripDetail.chatSystemTripFinalized');
  } else if (payload.kind === 'activity_change') {
    const key =
      payload.change === 'created'
        ? 'tripDetail.chatSystemActivityCreated'
        : payload.change === 'removed'
          ? 'tripDetail.chatSystemActivityRemoved'
          : 'tripDetail.chatSystemActivityUpdated';
    text = t(key, { title: payload.title });
  } else {
    text = '';
  }

  return (
    <div className="flex justify-center w-full py-2">
      <div
        className="inline-flex max-w-[90%] items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-100"
        role="status"
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>{text}</span>
      </div>
    </div>
  );
}
