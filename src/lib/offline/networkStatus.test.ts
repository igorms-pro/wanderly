import { describe, expect, it } from 'vitest';
import { isBrowserOnline } from './networkStatus';

describe('networkStatus', () => {
  it('reports online in jsdom by default', () => {
    expect(isBrowserOnline()).toBe(true);
  });
});
