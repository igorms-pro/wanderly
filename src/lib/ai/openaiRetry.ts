/** HTTP status from OpenAI SDK error (or similar) attached as `cause`. */
export function extractHttpStatus(cause: unknown): number | undefined {
  if (!cause || typeof cause !== 'object') return undefined;
  if (!('status' in cause)) return undefined;
  const status = (cause as { status?: number }).status;
  if (typeof status !== 'number' || Number.isNaN(status)) return undefined;
  return status;
}

/** Whether a failed chat completion is worth retrying (transient / overloaded). */
export function shouldRetryAfterOpenAIChatFailure(error: {
  code: string;
  cause?: unknown;
}): boolean {
  if (
    error.code === 'config_missing' ||
    error.code === 'empty_response' ||
    error.code === 'invalid_json'
  ) {
    return false;
  }

  const status = extractHttpStatus(error.cause);
  if (status === 400 || status === 401 || status === 403) return false;
  if (status === 429 || status === 502 || status === 503 || status === 504) return true;
  if (status !== undefined && status >= 500) return true;
  return error.code === 'request_failed';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
