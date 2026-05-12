import { describe, expect, it } from 'vitest';

import { extractHttpStatus, shouldRetryAfterOpenAIChatFailure } from './openaiRetry';

describe('openaiRetry', () => {
  describe('extractHttpStatus', () => {
    it('returns numeric status from cause', () => {
      expect(extractHttpStatus({ status: 429 })).toBe(429);
    });

    it('returns undefined when missing', () => {
      expect(extractHttpStatus(null)).toBeUndefined();
      expect(extractHttpStatus({})).toBeUndefined();
    });
  });

  describe('shouldRetryAfterOpenAIChatFailure', () => {
    it('does not retry client / parse errors', () => {
      expect(shouldRetryAfterOpenAIChatFailure({ code: 'config_missing' })).toBe(false);
      expect(shouldRetryAfterOpenAIChatFailure({ code: 'invalid_json' })).toBe(false);
      expect(shouldRetryAfterOpenAIChatFailure({ code: 'empty_response' })).toBe(false);
      expect(
        shouldRetryAfterOpenAIChatFailure({ code: 'request_failed', cause: { status: 401 } }),
      ).toBe(false);
    });

    it('retries rate limit and server errors', () => {
      expect(
        shouldRetryAfterOpenAIChatFailure({ code: 'request_failed', cause: { status: 429 } }),
      ).toBe(true);
      expect(
        shouldRetryAfterOpenAIChatFailure({ code: 'request_failed', cause: { status: 503 } }),
      ).toBe(true);
      expect(
        shouldRetryAfterOpenAIChatFailure({ code: 'request_failed', cause: { status: 502 } }),
      ).toBe(true);
    });

    it('retries generic request_failed without status (e.g. network)', () => {
      expect(shouldRetryAfterOpenAIChatFailure({ code: 'request_failed' })).toBe(true);
    });
  });
});
