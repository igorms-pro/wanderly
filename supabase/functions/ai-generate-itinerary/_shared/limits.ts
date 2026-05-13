/** Mirror client-side aiScenarioLimits.ts — single source for Edge authorization. */
export const MAX_AI_SCENARIOS_FREE = 3;
export const MAX_AI_SCENARIOS_PREMIUM = 10;

export const MAX_AI_SUGGESTIONS_FREE_PER_MONTH = 50;
export const MAX_AI_SUGGESTIONS_PREMIUM_PER_MONTH = 200;

export type AiTier = 'free' | 'premium';

export function maxAiScenariosForTier(tier: AiTier): number {
  return tier === 'premium' ? MAX_AI_SCENARIOS_PREMIUM : MAX_AI_SCENARIOS_FREE;
}

export function maxSuggestionsPerMonthForTier(tier: AiTier): number {
  return tier === 'premium'
    ? MAX_AI_SUGGESTIONS_PREMIUM_PER_MONTH
    : MAX_AI_SUGGESTIONS_FREE_PER_MONTH;
}
