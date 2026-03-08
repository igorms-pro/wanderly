import { Analytics } from '../analytics';
import { callOpenAIChat, OpenAIError, parseJSONResponse } from './openai-client';
import { generateMockItinerary } from './openai-itinerary-mock';
import { activitySuggestionsSchema, aiItineraryScenarioSchema } from './openai-itinerary-types';
import type {
  AIActivitySuggestion,
  GenerateActivitySuggestionsParams,
  GenerateItineraryParams,
  GeneratedItinerary,
} from './openai-itinerary-types';
import { buildItineraryPrompt, buildActivitySuggestionsPrompt } from './openai-prompts';

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

const isDemoApiKey = () => {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return !key || key === 'dsdsadas';
};

export async function generateItineraryFromConstraints(
  params: GenerateItineraryParams,
): Promise<GeneratedItinerary> {
  const { request, locale } = params;

  if (isDemoApiKey()) {
    return generateMockItinerary(request);
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
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        responseFormat: 'json_object',
        temperature: 0.7,
      },
    );

    const itinerary = parseJSONResponse(result.content, aiItineraryScenarioSchema);

    Analytics.capture('openai_itinerary_generated', {
      duration_ms: Math.round(result.durationMs),
      model: 'gpt-4.1-mini',
      total_tokens: result.usage?.totalTokens,
    });

    return itinerary;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[OpenAI] Error generating itinerary from constraints:', error);
    }

    if (error instanceof OpenAIError && error.code === 'config_missing') {
      return generateMockItinerary(params.request);
    }

    Analytics.trackError(
      error instanceof Error ? error.message : 'Unknown itinerary generation error',
      'openai_itinerary_generation',
    );

    return generateMockItinerary(params.request);
  }
}

export async function generateActivitySuggestions(
  params: GenerateActivitySuggestionsParams,
): Promise<AIActivitySuggestion[]> {
  if (isDemoApiKey()) {
    return [];
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
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        responseFormat: 'json_object',
        temperature: 0.8,
      },
    );

    const suggestions = parseJSONResponse(result.content, activitySuggestionsSchema);

    Analytics.capture('openai_activity_suggestions_generated', {
      destination: params.destination,
      date: params.date,
      count: suggestions.length,
      duration_ms: Math.round(result.durationMs),
    });

    return suggestions;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[OpenAI] Error generating activity suggestions:', error);
    }

    Analytics.trackError(
      error instanceof Error ? error.message : 'Unknown activity suggestions error',
      'openai_activity_suggestions',
    );

    return [];
  }
}
