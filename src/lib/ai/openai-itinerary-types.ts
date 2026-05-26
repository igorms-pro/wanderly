import { z } from 'zod';

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

export const dayActivitySchema = z.object({
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

export const itineraryDaySchema = z.object({
  date: z.string(),
  dayIndex: z.number(),
  activities: z.array(dayActivitySchema),
});

export const aiItineraryScenarioSchema = z.object({
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

export const activitySuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  suggestedTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
});

export const activitySuggestionsSchema = z.array(activitySuggestionSchema);

export interface GenerateItineraryParams {
  request: ItineraryRequest;
  locale?: string;
  tripId?: string;
  /** Used when generating via Supabase Edge (member count for prompt). */
  membersCount?: number;
}

export interface GenerateActivitySuggestionsParams {
  destination: string;
  date: string;
  existingActivities: string[];
  interests?: string[];
  locale?: string;
  tripId?: string;
}
