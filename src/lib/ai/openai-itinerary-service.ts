import { z } from 'zod';

import { Analytics } from '../analytics';
import {
  AiSuggestionsEdgeError,
  invokeAiActivitySuggestions,
  invokeAiGenerateItinerary,
} from './aiEdgeClient';
import { AiScenarioGenerationError } from './aiScenarioGenerationError';
import {
  callOpenAIChat,
  OpenAIError,
  parseJSONResponse,
  type OpenAIChatUsage,
} from './openai-client';
import {
  buildItineraryPrompt,
  buildActivitySuggestionsPrompt,
  ITINERARY_PROMPT_VERSION,
} from './openai-prompts';
import { extractHttpStatus } from './openaiRetry';

export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  pace?: 'relaxed' | 'balanced' | 'packed';
  budget?: number;
  currency?: string;
  interests?: string[];
  dietaryRestrictions?: string[];
  accessibility?: string[];
  has_children?: boolean;
  must_dos?: string[];
  no_gos?: string[];
}

const dayActivitySchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  estimatedCost: z.number(),
  location: z
    .object({
      lat: z.number().optional(),
      lon: z.number().optional(),
      address: z.string().optional(),
    })
    .optional(),
});

const itineraryDaySchema = z.object({
  date: z.string(),
  dayIndex: z.number(),
  activities: z.array(dayActivitySchema),
});

const aiItineraryScenarioSchema = z.object({
  title: z.string(),
  destination: z.string(),
  days: z.array(itineraryDaySchema),
});

export type DayActivity = z.infer<typeof dayActivitySchema>;

export type ItineraryDay = z.infer<typeof itineraryDaySchema>;

export type GeneratedItinerary = z.infer<typeof aiItineraryScenarioSchema>;

export type AIItineraryScenario = GeneratedItinerary;

export interface AIActivitySuggestion {
  title: string;
  description: string;
  category: string;
  suggestedTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

const activitySuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  suggestedTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
});

const activitySuggestionsSchema = z.array(activitySuggestionSchema);

function estimateGpt41MiniCostUsdCents(usage?: OpenAIChatUsage): number | undefined {
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

export interface GenerateItineraryParams {
  request: ItineraryRequest;
  locale?: string;
  tripId?: string;
  /** Used when generating via Supabase Edge (member count for prompt). */
  membersCount?: number;
}

function isEdgeAiGenerationMode(): boolean {
  const mode = import.meta.env.VITE_AI_GENERATION_MODE;
  return (mode ?? 'edge') !== 'client';
}

const isDemoApiKey = () => {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return !key || key === 'dsdsadas';
};

function mapItineraryFailureToAiScenarioError(error: unknown): AiScenarioGenerationError {
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

      const estimatedCostUsdCents = estimateGpt41MiniCostUsdCents({
        promptTokens: usage?.prompt_tokens,
        completionTokens: usage?.completion_tokens,
      });

      Analytics.capture('openai_itinerary_generated', {
        trip_id: params.tripId,
        duration_ms: usage?.duration_ms,
        model: 'gpt-4o-mini',
        total_tokens: usage?.total_tokens,
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        estimated_cost_usd_cents: estimatedCostUsdCents,
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

    const estimatedCostUsdCents = estimateGpt41MiniCostUsdCents(result.usage);

    Analytics.capture('openai_itinerary_generated', {
      trip_id: params.tripId,
      duration_ms: Math.round(result.durationMs),
      model: 'gpt-4.1-mini',
      total_tokens: result.usage?.totalTokens,
      prompt_tokens: result.usage?.promptTokens,
      completion_tokens: result.usage?.completionTokens,
      estimated_cost_usd_cents: estimatedCostUsdCents,
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

export interface GenerateActivitySuggestionsParams {
  destination: string;
  date: string;
  existingActivities: string[];
  interests?: string[];
  locale?: string;
  tripId?: string;
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

function generateMockActivitySuggestions(params: {
  destination: string;
  locale?: string;
}): AIActivitySuggestion[] {
  const dest = params.destination.trim() || 'your destination';
  const isFr = params.locale?.toLowerCase().startsWith('fr');
  if (isFr) {
    return [
      {
        title: `Balade dans ${dest}`,
        description: 'Quartiers emblématiques, pauses photo et pause dans un café local.',
        category: 'exploration',
        suggestedTimeOfDay: 'morning',
      },
      {
        title: 'Musée ou monument phare',
        description:
          "Bloc culture d'environ deux heures ; prévoir billet ou réservation si besoin.",
        category: 'culture',
        suggestedTimeOfDay: 'afternoon',
      },
      {
        title: 'Dîner convivial',
        description: 'Restaurant avec spécialités régionales, ambiance détendue.',
        category: 'food',
        suggestedTimeOfDay: 'evening',
      },
    ];
  }
  return [
    {
      title: `Neighborhood walk — ${dest}`,
      description: 'Iconic streets, photo stops, and a local café break.',
      category: 'exploration',
      suggestedTimeOfDay: 'morning',
    },
    {
      title: 'Landmark or museum block',
      description: 'About two hours of culture; book ahead if tickets are required.',
      category: 'culture',
      suggestedTimeOfDay: 'afternoon',
    },
    {
      title: 'Casual dinner',
      description: 'Regional flavors at a friendly spot.',
      category: 'food',
      suggestedTimeOfDay: 'evening',
    },
  ];
}

// Generate mock itinerary for demo purposes
export function generateMockItinerary(request: ItineraryRequest): GeneratedItinerary {
  const { destination, startDate, endDate, groupSize } = request;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const days: ItineraryDay[] = [];

  for (let i = 0; i < numDays; i += 1) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + i);

    const activities: DayActivity[] = [];

    if (i === 0) {
      activities.push({
        title: 'Arrival and Hotel Check-in',
        description: `Arrive at ${destination} and settle into your accommodation. Take time to freshen up and rest after your journey.`,
        category: 'logistics',
        startTime: '14:00',
        endTime: '16:00',
        estimatedCost: 0,
      });
      activities.push({
        title: 'Welcome Dinner at Local Restaurant',
        description:
          'Experience authentic local cuisine at a highly-rated restaurant in the city center. Try signature dishes and meet your fellow travelers.',
        category: 'food',
        startTime: '19:00',
        endTime: '21:00',
        estimatedCost: 45,
      });
      activities.push({
        title: 'Evening City Walk',
        description:
          'Take a leisurely walk around the neighborhood to get oriented and discover local shops and cafes.',
        category: 'exploration',
        startTime: '21:30',
        endTime: '23:00',
        estimatedCost: 0,
      });
    } else if (i === numDays - 1) {
      activities.push({
        title: 'Breakfast at Hotel',
        description: 'Enjoy a final breakfast and prepare for checkout.',
        category: 'food',
        startTime: '08:00',
        endTime: '09:00',
        estimatedCost: 15,
      });
      activities.push({
        title: 'Last-Minute Souvenir Shopping',
        description: 'Pick up any last-minute gifts and souvenirs at local markets or shops.',
        category: 'shopping',
        startTime: '09:30',
        endTime: '11:30',
        estimatedCost: 50,
      });
      activities.push({
        title: 'Hotel Checkout and Airport Transfer',
        description: 'Check out of the hotel and head to the airport for your departure flight.',
        category: 'logistics',
        startTime: '12:00',
        endTime: '14:00',
        estimatedCost: 30,
      });
    } else {
      activities.push({
        title: 'Breakfast Café Experience',
        description: 'Start your day at a charming local café with fresh pastries and coffee.',
        category: 'food',
        startTime: '08:00',
        endTime: '09:00',
        estimatedCost: 12,
      });
      activities.push({
        title: 'Historical Landmark Tour',
        description: `Explore one of ${destination}'s most iconic historical sites with a guided tour. Learn about the rich history and cultural significance.`,
        category: 'culture',
        startTime: '09:30',
        endTime: '12:30',
        estimatedCost: 25,
      });
      activities.push({
        title: 'Lunch at Traditional Restaurant',
        description: 'Savor regional specialties at a restaurant recommended by locals.',
        category: 'food',
        startTime: '13:00',
        endTime: '14:30',
        estimatedCost: 30,
      });
      activities.push({
        title: 'Afternoon Museum Visit',
        description:
          'Visit a world-class museum showcasing local art, history, or science exhibits.',
        category: 'culture',
        startTime: '15:00',
        endTime: '17:30',
        estimatedCost: 18,
      });
      activities.push({
        title: 'Sunset Viewpoint',
        description: 'Watch the sunset from a scenic viewpoint with panoramic city views.',
        category: 'nature',
        startTime: '18:00',
        endTime: '19:00',
        estimatedCost: 0,
      });
      activities.push({
        title: 'Dinner and Evening Entertainment',
        description:
          'Enjoy dinner followed by local entertainment - music, dance, or theater performance.',
        category: 'entertainment',
        startTime: '19:30',
        endTime: '22:00',
        estimatedCost: 60,
      });
    }

    days.push({
      date: currentDate.toISOString().split('T')[0],
      dayIndex: i + 1,
      activities,
    });
  }

  return {
    title: `${numDays}-Day ${destination} Adventure for ${groupSize} travelers`,
    destination,
    days,
  };
}
