interface ProposedChangeBadgeProps {
  visible: boolean;
  t: (key: string) => string;
}

export function ProposedChangeBadge({ visible, t }: ProposedChangeBadgeProps) {
  if (!visible) return null;
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
      {t('tripDetail.proposedChangeBadge')}
    </span>
  );
}
