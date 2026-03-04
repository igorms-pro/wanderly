interface TimelineActivityNotesProps {
  notes: string | null | undefined;
  t: (key: string) => string;
}

export function TimelineActivityNotes({ notes, t }: TimelineActivityNotesProps) {
  const trimmed = notes?.trim();

  if (!trimmed) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
      <p className="text-[11px] font-medium text-amber-800 dark:text-amber-200 mb-0.5">
        {t('tripDetail.organizerNote')}
      </p>
      <p className="text-xs text-amber-900 dark:text-amber-100">{trimmed}</p>
    </div>
  );
}
