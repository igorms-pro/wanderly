import { z } from 'npm:zod';

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

export const aiItineraryScenarioSchema = z.object({
  title: z.string(),
  destination: z.string(),
  days: z.array(itineraryDaySchema),
});

export type GeneratedItineraryEdge = z.infer<typeof aiItineraryScenarioSchema>;

const activitySuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  suggestedTimeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
});

export function parseSuggestionsPayload(
  content: string,
): z.infer<typeof activitySuggestionSchema>[] {
  const json = JSON.parse(content) as unknown;
  if (Array.isArray(json)) {
    return z.array(activitySuggestionSchema).parse(json);
  }
  if (!json || typeof json !== 'object') throw new Error('invalid_payload');
  const raw = json as Record<string, unknown>;
  const arr = raw.suggestions ?? raw.activities;
  if (!Array.isArray(arr)) throw new Error('invalid_payload');
  return z.array(activitySuggestionSchema).parse(arr);
}
