import type { ReactNode } from 'react';

export type ChatMentionTone = 'onPrimary' | 'onSurface';

function mentionClassForTone(tone: ChatMentionTone): string {
  if (tone === 'onPrimary') {
    return 'font-semibold text-amber-100 underline decoration-amber-200/80';
  }
  return 'font-semibold text-orange-600 dark:text-orange-400';
}

export function renderChatTextWithMentions(
  text: string,
  slugToLabel: Map<string, string>,
  keyPrefix: string,
  tone: ChatMentionTone = 'onSurface',
): ReactNode[] {
  if (!text) return [''];
  if (slugToLabel.size === 0) return [text];

  const mentionClass = mentionClassForTone(tone);

  const slugs = [...slugToLabel.keys()].sort((a, b) => b.length - a.length);
  const inner = slugs.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`@(${inner})\\b`, 'gi');

  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let partIdx = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      partIdx += 1;
      parts.push(text.slice(last, match.index));
    }
    const rawSlug = match[1] ?? '';
    const slugKey = rawSlug.toLowerCase();
    const label = slugToLabel.get(slugKey);
    const token = match[0];
    if (label) {
      partIdx += 1;
      parts.push(
        <span key={`${keyPrefix}-m-${partIdx}`} className={mentionClass} title={label}>
          {token}
        </span>,
      );
    } else {
      partIdx += 1;
      parts.push(token);
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length > 0 ? parts : [text];
}
