import { describe, it, expect } from 'vitest';

import type { TripConstraints } from '../types/database.types';
import { normalizeTime, parseTripConstraints } from './tripDetailSlice.aiScenarioOps';

describe('tripDetailSlice.aiScenarioOps helpers', () => {
  describe('normalizeTime', () => {
    it('adds seconds when time is in HH:mm format', () => {
      expect(normalizeTime('09:30')).toBe('09:30:00');
      expect(normalizeTime('23:59')).toBe('23:59:00');
    });

    it('returns value unchanged when seconds are already present', () => {
      expect(normalizeTime('09:30:15')).toBe('09:30:15');
    });
  });

  describe('parseTripConstraints', () => {
    it('returns null when constraints is not an object', () => {
      expect(parseTripConstraints(null)).toBeNull();
      // string should not be treated as valid constraints object
      expect(parseTripConstraints('test')).toBeNull();
    });

    it('returns constraints as TripConstraints when shape is correct', () => {
      const constraints: TripConstraints = {
        pace: 'balanced',
        has_children: true,
        preferences: 'food',
        budget_per_person_cents: 50000,
        budget_total_cents: null,
      };

      const result = parseTripConstraints(constraints);
      expect(result).not.toBeNull();
      expect(result?.pace).toBe('balanced');
      expect(result?.has_children).toBe(true);
      expect(result?.preferences).toBe('food');
    });
  });
});
