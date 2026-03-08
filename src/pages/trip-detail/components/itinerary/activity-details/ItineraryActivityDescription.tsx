import { FileText } from 'lucide-react';

interface ItineraryActivityDescriptionProps {
  description: string | null | undefined;
  t: (key: string) => string;
}

export function ItineraryActivityDescription({
  description,
  t,
}: ItineraryActivityDescriptionProps) {
  return (
    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
      <FileText className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{description?.trim() || t('tripDetail.descriptionNotSet')}</span>
    </div>
  );
}
