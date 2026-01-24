
export const TIER_LEVELS = {
    LAYER_0: 'layer_0',
    LAYER_1: 'layer_1',
    LAYER_2: 'layer_2',
    LAYER_3: 'layer_3'
} as const;

export type TierLevel = typeof TIER_LEVELS[keyof typeof TIER_LEVELS];

export const PERSONA_LIMITS: Record<TierLevel, number> = {
    [TIER_LEVELS.LAYER_0]: 0,
    [TIER_LEVELS.LAYER_1]: 1,
    [TIER_LEVELS.LAYER_2]: 5,
    [TIER_LEVELS.LAYER_3]: 10
};

export const getPersonaLimit = (tier: string | undefined): number => {
    if (!tier) return 0;
    return PERSONA_LIMITS[tier as TierLevel] || 0;
};
