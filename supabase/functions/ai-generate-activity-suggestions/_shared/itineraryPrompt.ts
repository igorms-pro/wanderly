/** Duplicated from src/lib/ai/openai-prompts.ts for Edge — keep prompt_version in sync manually or bump ITINERARY_PROMPT_VERSION in app. */
export const ITINERARY_PROMPT_VERSION_EDGE = '1';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type ItineraryRequestPayload = {
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  pace?: 'relaxed' | 'balanced' | 'packed';
  budget?: number;
  currency?: string;
  interests?: string[];
  has_children?: boolean;
  must_dos?: string[];
  no_gos?: string[];
};

function calculateTripLengthDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

function getLanguageInstruction(locale?: string): string {
  if (!locale) return 'Respond in English.';
  if (locale.startsWith('fr')) return 'Réponds en français.';
  if (locale.startsWith('en')) return 'Respond in English.';
  return 'Respond in English.';
}

export function buildItineraryPromptEdge(
  request: ItineraryRequestPayload,
  locale?: string,
): string {
  const {
    destination,
    startDate,
    endDate,
    groupSize,
    pace = 'balanced',
    budget,
    currency,
    interests = [],
    has_children,
    must_dos = [],
    no_gos = [],
  } = request;

  const days = calculateTripLengthDays(startDate, endDate);
  const languageInstruction = getLanguageInstruction(locale);

  const budgetLine = budget ? `- Budget: ${budget} ${currency || 'USD'}` : '';
  const interestsLine = interests.length > 0 ? `- Interests: ${interests.join(', ')}` : '';
  const childrenLine =
    has_children === true
      ? '- Traveling with children: prioritize family-friendly pacing, shorter blocks, and safe activities.'
      : has_children === false
        ? '- Adults-only trip (no special child constraints).'
        : '';
  const mustDosLine =
    must_dos.length > 0 ? `- Must-do / strong preferences: ${must_dos.join('; ')}` : '';
  const noGosLine = no_gos.length > 0 ? `- Avoid / no-go topics: ${no_gos.join('; ')}` : '';

  return `Create a detailed ${days}-day travel itinerary for ${destination}.

Trip Details:
- Dates: ${startDate} to ${endDate} (${days} days)
- Group size: ${groupSize} people
- Pace: ${pace}
${budgetLine}
${interestsLine}
${childrenLine}
${mustDosLine}
${noGosLine}

Please provide a day-by-day itinerary with 3-5 activities per day. For each activity include:
- Activity title
- Brief description (1-2 sentences)
- Category (culture, food, nature, adventure, relaxation, shopping, etc.)
- Start time (HH:MM format)
- End time (HH:MM format)
- Estimated cost per person in ${currency || 'USD'}

Format your response as JSON with this structure:
{
  "title": "Trip title",
  "destination": "${destination}",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayIndex": 1,
      "activities": [
        {
          "title": "Activity name",
          "description": "Description",
          "category": "Category",
          "startTime": "09:00",
          "endTime": "11:00",
          "estimatedCost": 20
        }
      ]
    }
  ]
}

${languageInstruction}

Ensure activities are scheduled logically (breakfast in morning, dinner in evening, etc.) and allow travel time between locations.`;
}

export function buildActivitySuggestionsPromptEdge(params: {
  destination: string;
  date: string;
  existingActivities: string[];
  interests?: string[];
  locale?: string;
}): string {
  const { destination, date, existingActivities, interests = [], locale } = params;
  const languageInstruction = getLanguageInstruction(locale);
  const interestsLine = interests.length > 0 ? `User interests: ${interests.join(', ')}` : '';
  const existingLine =
    existingActivities.length > 0
      ? `Existing activities for this day: ${existingActivities.join('; ')}.`
      : 'No existing activities for this day yet.';

  return `Suggest 3-5 additional travel activities for a group visiting ${destination} on ${date}.

${interestsLine}
${existingLine}

Return only a JSON object (no markdown) with a single key "suggestions" whose value is an array of objects, each having:
- title
- description
- category
- suggestedTimeOfDay ("morning" | "afternoon" | "evening" | "night")

Example shape: { "suggestions": [ { "title": "...", "description": "...", "category": "food", "suggestedTimeOfDay": "morning" } ] }

${languageInstruction}`;
}
