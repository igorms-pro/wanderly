import { AiScenarioGenerationError } from './aiScenarioGenerationError';
import { OpenAIError, type OpenAIChatUsage } from './openai-client';
import { activitySuggestionsSchema } from './openai-itinerary-types';
import type { AIActivitySuggestion } from './openai-itinerary-types';
import { extractHttpStatus } from './openaiRetry';

export function estimateGpt41MiniCostUsdCents(usage?: OpenAIChatUsage): number | undefined {
  if (!usage) return undefined;
  const pt = usage.promptTokens ?? 0;
  const ct = usage.completionTokens ?? 0;
  if (!pt && !ct) return undefined;
  const usd = (pt / 1_000_000) * 0.15 + (ct / 1_000_000) * 0.6;
  return Math.round(usd * 100);
}

export function parseActivitySuggestionsPayload(content: string): AIActivitySuggestion[] {
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch {
    throw new OpenAIError('Invalid suggestions payload', { code: 'invalid_json' });
  }
  if (Array.isArray(json)) {
    return activitySuggestionsSchema.parse(json);
  }
  if (!json || typeof json !== 'object') {
    throw new OpenAIError('Invalid suggestions payload', { code: 'invalid_json' });
  }
  const raw = json as Record<string, unknown>;
  const arr = raw.suggestions ?? raw.activities;
  if (!Array.isArray(arr)) {
    throw new OpenAIError('Invalid suggestions payload', { code: 'invalid_json' });
  }
  return activitySuggestionsSchema.parse(arr);
}

export function isEdgeAiGenerationMode(): boolean {
  const mode = import.meta.env.VITE_AI_GENERATION_MODE;
  return (mode ?? 'edge') !== 'client';
}

export const isDemoApiKey = (): boolean => {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return !key || key === 'dsdsadas';
};

export function mapItineraryFailureToAiScenarioError(error: unknown): AiScenarioGenerationError {
  if (error instanceof AiScenarioGenerationError) return error;
  if (error instanceof OpenAIError) {
    if (error.code === 'config_missing') return new AiScenarioGenerationError('openai_config');
    if (error.code === 'invalid_json') return new AiScenarioGenerationError('openai_parse');
    const status = extractHttpStatus(error.cause);
    if (status === 401 || status === 403) return new AiScenarioGenerationError('openai_auth');
    if (status === 429) return new AiScenarioGenerationError('openai_rate_limit');
    if (status !== undefined && status >= 500)
      return new AiScenarioGenerationError('openai_server');
    if (error.code === 'request_failed') return new AiScenarioGenerationError('openai_network');
  }
  return new AiScenarioGenerationError('unknown');
}
