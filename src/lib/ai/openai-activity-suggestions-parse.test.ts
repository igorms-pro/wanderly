import { describe, expect, it } from 'vitest';

import { parseActivitySuggestionsPayload } from '@/lib/ai/openai-itinerary-service';

describe('parseActivitySuggestionsPayload', () => {
  it('parses a top-level array', () => {
    const raw = JSON.stringify([
      {
        title: 'Walk',
        description: 'Stroll',
        category: 'exploration',
        suggestedTimeOfDay: 'morning',
      },
    ]);
    const out = parseActivitySuggestionsPayload(raw);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Walk');
  });

  it('parses wrapped suggestions', () => {
    const raw = JSON.stringify({
      suggestions: [
        {
          title: 'Museum',
          description: 'Visit',
          category: 'culture',
          suggestedTimeOfDay: 'afternoon',
        },
      ],
    });
    const out = parseActivitySuggestionsPayload(raw);
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Museum');
  });

  it('accepts activities alias', () => {
    const raw = JSON.stringify({
      activities: [
        {
          title: 'Dinner',
          description: 'Eat',
          category: 'food',
          suggestedTimeOfDay: 'evening',
        },
      ],
    });
    const out = parseActivitySuggestionsPayload(raw);
    expect(out).toHaveLength(1);
  });
});
