import { describe, expect, it } from 'vitest';
import {
  addDaysToIsoDate,
  buildDateShiftMap,
  endDateFromStartAndDuration,
  tripDurationDays,
} from './shiftTripDates';

describe('shiftTripDates', () => {
  it('adds days across month boundaries', () => {
    expect(addDaysToIsoDate('2026-03-30', 3)).toBe('2026-04-02');
  });

  it('computes inclusive trip duration', () => {
    expect(tripDurationDays('2026-03-09', '2026-03-15')).toBe(7);
    expect(tripDurationDays('2026-03-09', '2026-03-09')).toBe(1);
  });

  it('maps source dates to shifted targets', () => {
    const map = buildDateShiftMap('2026-03-09', '2026-06-01', ['2026-03-09', '2026-03-10']);
    expect(map['2026-03-09']).toBe('2026-06-01');
    expect(map['2026-03-10']).toBe('2026-06-02');
  });

  it('derives end date from duration', () => {
    expect(endDateFromStartAndDuration('2026-06-01', 7)).toBe('2026-06-07');
  });
});
