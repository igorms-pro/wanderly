import { supabase } from '@/lib/supabase';

import type { GeneratedItinerary } from './openai-itinerary-service';
import type { AIActivitySuggestion } from './openai-itinerary-service';
import { AiScenarioGenerationError } from './aiScenarioGenerationError';

type EdgeUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  duration_ms?: number;
  prompt_version?: string;
};

function mapScenarioPayload(data: unknown): GeneratedItinerary {
  const d = data as {
    itinerary?: GeneratedItinerary;
    error?: string;
    code?: string;
  };
  if (d?.itinerary) return d.itinerary;
  if (d?.code === 'quota_exceeded') throw new AiScenarioGenerationError('quota_exceeded');
  if (d?.code === 'forbidden_ai') throw new AiScenarioGenerationError('forbidden_ai');
  if (d?.code === 'openai_config') throw new AiScenarioGenerationError('openai_config');
  if (d?.code === 'openai_auth') throw new AiScenarioGenerationError('openai_auth');
  if (d?.code === 'openai_rate_limit') throw new AiScenarioGenerationError('openai_rate_limit');
  if (d?.code === 'openai_parse') throw new AiScenarioGenerationError('openai_parse');
  if (d?.code === 'openai_network') throw new AiScenarioGenerationError('openai_network');
  throw new AiScenarioGenerationError('unknown');
}

export async function invokeAiGenerateItinerary(params: {
  tripId: string;
  locale?: string;
  membersCount: number;
}): Promise<{ itinerary: GeneratedItinerary; usage?: EdgeUsage }> {
  const { data, error } = await supabase.functions.invoke('ai-generate-itinerary', {
    body: {
      tripId: params.tripId,
      locale: params.locale,
      membersCount: params.membersCount,
    },
  });

  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const body = (await ctx.json()) as { code?: string };
        if (body.code === 'quota_exceeded') throw new AiScenarioGenerationError('quota_exceeded');
        if (body.code === 'forbidden_ai') throw new AiScenarioGenerationError('forbidden_ai');
      } catch (e) {
        if (e instanceof AiScenarioGenerationError) throw e;
      }
    }
    throw new AiScenarioGenerationError('unknown');
  }

  const payload = data as {
    itinerary?: GeneratedItinerary;
    usage?: EdgeUsage;
    error?: string;
    code?: string;
  };
  const itinerary = mapScenarioPayload(payload);
  return { itinerary, usage: payload.usage };
}

export class AiSuggestionsEdgeError extends Error {
  readonly code: string;

  constructor(code: string, message?: string) {
    super(message ?? code);
    this.name = 'AiSuggestionsEdgeError';
    this.code = code;
  }
}

export async function invokeAiActivitySuggestions(params: {
  tripId: string;
  destination: string;
  date: string;
  existingActivities: string[];
  interests?: string[];
  locale?: string;
}): Promise<{ suggestions: AIActivitySuggestion[]; usage?: EdgeUsage }> {
  const { data, error } = await supabase.functions.invoke('ai-generate-activity-suggestions', {
    body: {
      tripId: params.tripId,
      destination: params.destination,
      date: params.date,
      existingActivities: params.existingActivities,
      interests: params.interests,
      locale: params.locale,
    },
  });

  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const body = (await ctx.json()) as { code?: string };
        if (body.code === 'suggestions_quota_exceeded') {
          throw new AiSuggestionsEdgeError('suggestions_quota_exceeded');
        }
        if (body.code === 'forbidden_ai') throw new AiSuggestionsEdgeError('forbidden_ai');
      } catch (e) {
        if (e instanceof AiSuggestionsEdgeError) throw e;
      }
    }
    throw new AiSuggestionsEdgeError('unknown');
  }

  const payload = data as {
    suggestions?: AIActivitySuggestion[];
    usage?: EdgeUsage;
    error?: string;
    code?: string;
  };

  if (payload.code === 'suggestions_quota_exceeded') {
    throw new AiSuggestionsEdgeError('suggestions_quota_exceeded');
  }
  if (payload.code === 'forbidden_ai') throw new AiSuggestionsEdgeError('forbidden_ai');
  if (payload.error && !payload.suggestions) {
    throw new AiSuggestionsEdgeError(payload.code ?? 'unknown', payload.error);
  }

  return { suggestions: payload.suggestions ?? [], usage: payload.usage };
}
