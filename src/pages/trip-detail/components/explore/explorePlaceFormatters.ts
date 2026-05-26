export function formatPlacePriceLevel(level?: number): string | null {
  if (level == null || level < 0) return null;
  const capped = Math.min(level, 4);
  return '$'.repeat(capped + 1);
}
