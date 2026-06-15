const {
    TIER_LEVELS,
    normalizeRequiredTier
} = require('./tier-levels');

describe('normalizeRequiredTier', () => {
    test.each([
        ['L1', TIER_LEVELS.LAYER_1],
        ['L2', TIER_LEVELS.LAYER_2],
        ['L3', TIER_LEVELS.LAYER_3],
        [TIER_LEVELS.LAYER_2, TIER_LEVELS.LAYER_2]
    ])('normalizes %s to %s', (input, expected) => {
        expect(normalizeRequiredTier(input)).toBe(expected);
    });

    test.each([undefined, null, '', TIER_LEVELS.LAYER_0, 'invalid'])(
        'defaults %s to layer_1',
        (input) => {
            expect(normalizeRequiredTier(input)).toBe(TIER_LEVELS.LAYER_1);
        }
    );
});
