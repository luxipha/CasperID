const { validateOnDeviceLiveness } = require('./verification-v2');

describe('on-device liveness result validation', () => {
    test('accepts a fresh completed challenge sequence', () => {
        expect(validateOnDeviceLiveness({
            faceHeldMs: 3000,
            blinkCount: 3,
            mouthOpenRatio: 0.2,
            mouthHeldMs: 1000,
            completedAt: Date.now()
        })).toMatchObject({ passed: true });
    });

    test('rejects incomplete or stale challenge results', () => {
        expect(validateOnDeviceLiveness({
            faceHeldMs: 2999,
            blinkCount: 2,
            mouthOpenRatio: 0.1,
            mouthHeldMs: 500,
            completedAt: Date.now() - (6 * 60 * 1000)
        })).toMatchObject({
            passed: false,
            checks: {
                recent: false,
                faceHeld: false,
                blinkChallenge: false,
                mouthChallenge: false
            }
        });
    });
});
