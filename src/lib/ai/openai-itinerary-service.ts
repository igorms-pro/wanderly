import { Analytics } from '../analytics';
import {
  AiSuggestionsEdgeError,
  invokeAiActivitySuggestions,
  invokeAiGenerateItinerary,
} from './aiEdgeClient';
import { AiScenarioGenerationError } from './aiScenarioGenerationError';
import { callOpenAIChat, parseJSONResponse } from './openai-client';
import {
  estimateGpt41MiniCostUsdCents,
  isDemoApiKey,
  isEdgeAiGenerationMode,
  mapItineraryFailureToAiScenarioError,
  parseActivitySuggestionsPayload,
} from './openai-itinerary-helpers';
import { generateMockActivitySuggestions, generateMockItinerary } from './openai-itinerary-mock';
import { aiItineraryScenarioSchema } from './openai-itinerary-types';
import type {
  AIActivitySuggestion,
  GenerateActivitySuggestionsParams,
  GenerateItineraryParams,
  GeneratedItinerary,
} from './openai-itinerary-types';
import {
  buildItineraryPrompt,
  buildActivitySuggestionsPrompt,
  ITINERARY_PROMPT_VERSION,
} from './openai-prompts';

export type {
  ItineraryRequest,
  DayActivity,
  ItineraryDay,
  GeneratedItinerary,
  AIItineraryScenario,
  AIActivitySuggestion,
  GenerateItineraryParams,
  GenerateActivitySuggestionsParams,
} from './openai-itinerary-types';

export { generateMockItinerary } from './openai-itinerary-mock';
export { parseActivitySuggestionsPayload } from './openai-itinerary-helpers';

export async function generateItineraryFromConstraints(
  params: GenerateItineraryParams,
): Promise<GeneratedItinerary> {
  const { request, locale } = params;

  if (isDemoApiKey()) {
    return generateMockItinerary(request);
  }

  if (isEdgeAiGenerationMode() && params.tripId) {
    try {
      const { itinerary, usage } = await invokeAiGenerateItinerary({
        tripId: params.tripId,
        locale,
        membersCount: Math.max(1, params.membersCount ?? 1),
      });

      Analytics.capture('openai_itinerary_generated', {
        trip_id: params.tripId,
        duration_ms: usage?.duration_ms,
        model: 'gpt-4o-mini',
        total_tokens: usage?.total_tokens,
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        estimated_cost_usd_cents: estimateGpt41MiniCostUsdCents({
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
        }),
        prompt_version: usage?.prompt_version ?? ITINERARY_PROMPT_VERSION,
        source: 'edge',
      });

      return itinerary;
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('[AI Edge] itinerary:', e);
      }
      if (e instanceof AiScenarioGenerationError) throw e;
      throw new AiScenarioGenerationError('unknown');
    }
  }

  try {
    const prompt = buildItineraryPrompt({ request, locale });

    const result = await callOpenAIChat(
      'gpt-4.1-mini',
      [
        {
          role: 'system',
          content:
            'You are a professional travel planner. Provide detailed, realistic, and well-structured travel itineraries in JSON format.',
        },
        { role: 'user', content: prompt },
      ],
      { responseFormat: 'json_object', temperature: 0.7 },
    );

    const itinerary = parseJSONResponse(result.content, aiItineraryScenarioSchema);

    Analytics.capture('openai_itinerary_generated', {
      trip_id: params.tripId,
      duration_ms: Math.round(result.durationMs),
      model: 'gpt-4.1-mini',
      total_tokens: result.usage?.totalTokens,
      prompt_tokens: result.usage?.promptTokens,
      completion_tokens: result.usage?.completionTokens,
      estimated_cost_usd_cents: estimateGpt41MiniCostUsdCents(result.usage),
      prompt_version: ITINERARY_PROMPT_VERSION,
    });

    return itinerary;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[OpenAI] Error generating itinerary from constraints:', error);
    }

    Analytics.capture('openai_itinerary_generation_failed', {
      trip_id: params.tripId,
      prompt_version: ITINERARY_PROMPT_VERSION,
    });

    Analytics.trackError(
      error instanceof Error ? error.message : 'Unknown itinerary generation error',
      'openai_itinerary_generation',
      { trip_id: params.tripId },
    );

    if (import.meta.env.DEV) {
      return generateMockItinerary(params.request);
    }

    throw mapItineraryFailureToAiScenarioError(error);
  }
}

/**
 * Suggests activities for one day (activity create/edit modal).
 */
export async function generateActivitySuggestions(
  params: GenerateActivitySuggestionsParams,
): Promise<AIActivitySuggestion[]> {
  if (isDemoApiKey()) {
    return generateMockActivitySuggestions(params);
  }

  if (isEdgeAiGenerationMode() && params.tripId) {
    try {
      const { suggestions, usage } = await invokeAiActivitySuggestions({
        tripId: params.tripId,
        destination: params.destination,
        date: params.date,
        existingActivities: params.existingActivities,
        interests: params.interests,
        locale: params.locale,
      });

      Analytics.capture('openai_activity_suggestions_generated', {
        trip_id: params.tripId,
        destination: params.destination,
        date: params.date,
        count: suggestions.length,
        duration_ms: usage?.duration_ms,
        total_tokens: usage?.total_tokens,
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        estimated_cost_usd_cents: estimateGpt41MiniCostUsdCents({
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
        }),
        source: 'edge',
      });

      return suggestions;
    } catch (e) {
      if (e instanceof AiSuggestionsEdgeError) throw e;
      if (import.meta.env.DEV) {
        console.error('[AI Edge] suggestions:', e);
      }
      return [];
    }
  }

  try {
    const prompt = buildActivitySuggestionsPrompt({
      destination: params.destination,
      date: params.date,
      existingActivities: params.existingActivities,
      interests: params.interests,
      locale: params.locale,
    });

    const result = await callOpenAIChat(
      'gpt-4.1-mini',
      [
        {
          role: 'system',
          content:
            'You are a professional travel planner. Suggest concise, high-quality activities as JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      { responseFormat: 'json_object', temperature: 0.8 },
    );

    const suggestions = parseActivitySuggestionsPayload(result.content);

    Analytics.capture('openai_activity_suggestions_generated', {
      trip_id: params.tripId,
      destination: params.destination,
      date: params.date,
      count: suggestions.length,
      duration_ms: Math.round(result.durationMs),
      total_tokens: result.usage?.totalTokens,
      prompt_tokens: result.usage?.promptTokens,
      completion_tokens: result.usage?.completionTokens,
      estimated_cost_usd_cents: estimateGpt41MiniCostUsdCents(result.usage),
    });

    return suggestions;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[OpenAI] Error generating activity suggestions:', error);
    }

    Analytics.trackError(
      error instanceof Error ? error.message : 'Unknown activity suggestions error',
      'openai_activity_suggestions',
      { trip_id: params.tripId, destination: params.destination },
    );

    return [];
  }
}
