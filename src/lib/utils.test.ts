import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names and dedupes conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', undefined, null, 'text-base')).toBe('text-base');
    expect(cn('flex', { hidden: false })).toContain('flex');
  });
});


