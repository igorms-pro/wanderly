/** AI scenario caps per trip — enforced server-side (Edge) + mirrored in UI. */

export type AiTier = 'free' | 'premium';

/** Free tier: compare a few scenario options without burning budget. */
export const MAX_AI_SCENARIOS_FREE_PER_TRIP = 3;

/** Premium tier: higher cap until Stripe tiers ship. */
export const MAX_AI_SCENARIOS_PREMIUM_PER_TRIP = 10;

/** @deprecated Use tier-specific max + maxAiScenariosForTier */
export const MAX_AI_SCENARIOS_PER_TRIP = MAX_AI_SCENARIOS_PREMIUM_PER_TRIP;

export const MAX_AI_SUGGESTIONS_FREE_PER_MONTH_PER_TRIP = 50;
export const MAX_AI_SUGGESTIONS_PREMIUM_PER_MONTH_PER_TRIP = 200;

export function maxAiScenariosForTier(tier: AiTier): number {
  return tier === 'premium' ? MAX_AI_SCENARIOS_PREMIUM_PER_TRIP : MAX_AI_SCENARIOS_FREE_PER_TRIP;
}

export function maxSuggestionsPerMonthForTier(tier: AiTier): number {
  return tier === 'premium'
    ? MAX_AI_SUGGESTIONS_PREMIUM_PER_MONTH_PER_TRIP
    : MAX_AI_SUGGESTIONS_FREE_PER_MONTH_PER_TRIP;
}
