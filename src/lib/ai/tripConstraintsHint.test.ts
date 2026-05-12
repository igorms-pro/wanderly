import { describe, expect, it } from 'vitest';

import { getAiConstraintsHintLevel } from './tripConstraintsHint';

describe('getAiConstraintsHintLevel', () => {
  it('returns ok when budget is set', () => {
    expect(getAiConstraintsHintLevel({}, 50_000)).toBe('ok');
  });

  it('returns ok when pace is set', () => {
    expect(getAiConstraintsHintLevel({ pace: 'balanced' }, null)).toBe('ok');
  });

  it('returns ok when traveling with children', () => {
    expect(getAiConstraintsHintLevel({ has_children: true }, null)).toBe('ok');
  });

  it('returns ok when preferences are non-empty', () => {
    expect(getAiConstraintsHintLevel({ preferences: ' museums ' }, null)).toBe('ok');
  });

  it('returns weak when nothing meaningful is set', () => {
    expect(getAiConstraintsHintLevel(null, null)).toBe('weak');
    expect(getAiConstraintsHintLevel({}, null)).toBe('weak');
    expect(getAiConstraintsHintLevel({ has_children: false }, null)).toBe('weak');
  });
});
