import { generateItineraryFromConstraints } from './ai/openai-itinerary-service';

export type {
  ItineraryRequest,
  DayActivity,
  ItineraryDay,
  GeneratedItinerary,
  AIItineraryScenario,
  AIActivitySuggestion,
  GenerateItineraryParams,
  GenerateActivitySuggestionsParams,
} from './ai/openai-itinerary-service';

export {
  generateItineraryFromConstraints,
  generateActivitySuggestions,
  generateMockItinerary,
} from './ai/openai-itinerary-service';

export { OpenAIError, callOpenAIChat, parseJSONResponse } from './ai/openai-client';

export async function generateItinerary(
  request: import('./ai/openai-itinerary-service').ItineraryRequest,
): Promise<import('./ai/openai-itinerary-service').GeneratedItinerary> {
  return generateItineraryFromConstraints({ request });
}

export default { generateItinerary };
