import { describe, expect, it } from 'vitest';
import { buildTemplateSnapshot } from './buildTemplateSnapshot';

describe('buildTemplateSnapshot', () => {
  it('stores day offsets and activity fields without ids', () => {
    const snapshot = buildTemplateSnapshot(
      {
        start_date: '2026-03-09',
        end_date: '2026-03-10',
        constraints: { pace: 'balanced' },
        budget_cents: 50000,
        currency: 'EUR',
        timezone: 'Europe/Paris',
      },
      [
        { id: 'day-1', date: '2026-03-09', day_index: 0 },
        { id: 'day-2', date: '2026-03-10', day_index: 1 },
      ],
      {
        'day-1': [
          {
            id: 'act-1',
            trip_id: 'trip-1',
            title: 'Museum',
            description: 'Morning visit',
            category: 'culture',
            status: 'proposed',
            source: 'manual',
            created_at: '2026-01-01',
          },
        ],
        'day-2': [],
      },
    );

    expect(snapshot.duration_days).toBe(2);
    expect(snapshot.timezone).toBe('Europe/Paris');
    expect(snapshot.days).toHaveLength(2);
    expect(snapshot.days[0].day_offset).toBe(0);
    expect(snapshot.days[0].activities[0].title).toBe('Museum');
    expect(snapshot.days[0].activities[0]).not.toHaveProperty('id');
  });
});
