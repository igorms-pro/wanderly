import { describe, it, expect } from 'vitest';

import type { Activity, Database } from '../types/database.types';
import { mapItineraryToScenario } from './tripDetailSlice.scenarios';

type ItineraryRow = Database['public']['Tables']['itineraries']['Row'];
type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

describe('tripDetailSlice.scenarios helpers', () => {
  it('groups activities by itinerary day and sorts days by index', () => {
    const itinerary: ItineraryRow = {
      id: 'it-1',
      trip_id: 'trip-1',
      version: 1,
      title: 'Test itinerary',
      generated_by_ai: false,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z',
      deleted_at: null,
    };

    const dayA: ItineraryDayRow = {
      id: 'day-a',
      itinerary_id: 'it-1',
      day_index: 2,
      date: '2025-01-02',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      deleted_at: null,
    };

    const dayB: ItineraryDayRow = {
      id: 'day-b',
      itinerary_id: 'it-1',
      day_index: 1,
      date: '2025-01-01',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      deleted_at: null,
    };

    const otherItineraryDay: ItineraryDayRow = {
      id: 'day-other',
      itinerary_id: 'it-2',
      day_index: 1,
      date: '2025-01-03',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      deleted_at: null,
    };

    const activity1: Activity = {
      id: 'act-1',
      itinerary_day_id: 'day-b',
      trip_id: 'trip-1',
      place_id: null,
      place_name: null,
      title: 'Breakfast',
      description: null,
      category: null,
      start_time: '08:00:00',
      end_time: null,
      cost_cents: null,
      cost_min_cents: null,
      cost_max_cents: null,
      currency: null,
      transport_type: null,
      transport_notes: null,
      transport_duration_minutes: null,
      transport_cost_cents: null,
      organizer_notes: null,
      packing_checklist: null,
      lat: null,
      lon: null,
      status: 'proposed',
      source: 'manual',
      created_at: '2025-01-01T07:00:00.000Z',
      updated_at: null,
      deleted_at: null,
    };

    const activity2: Activity = {
      ...activity1,
      id: 'act-2',
      itinerary_day_id: 'day-a',
      title: 'Dinner',
      created_at: '2025-01-02T18:00:00.000Z',
    };

    const activitiesByDayId: Record<string, Activity[]> = {
      'day-a': [activity2],
      'day-b': [activity1],
      // Ensure unrelated day does not leak in
      'day-other': [
        {
          ...activity1,
          id: 'act-3',
          itinerary_day_id: 'day-other',
          title: 'Should be ignored',
        },
      ],
    };

    const scenario = mapItineraryToScenario(
      itinerary,
      [dayA, dayB, otherItineraryDay],
      activitiesByDayId,
    );

    expect(scenario.days).toHaveLength(2);
    expect(scenario.days[0].id).toBe('day-b');
    expect(scenario.days[0].date).toBe('2025-01-01');
    expect(scenario.days[0].activities).toHaveLength(1);
    expect(scenario.days[0].activities[0].title).toBe('Breakfast');

    expect(scenario.days[1].id).toBe('day-a');
    expect(scenario.days[1].date).toBe('2025-01-02');
    expect(scenario.days[1].activities).toHaveLength(1);
    expect(scenario.days[1].activities[0].title).toBe('Dinner');
  });
});
