import { describe, expect, it } from 'vitest';
import { isSuccessfulLivenessResponse } from '../utils/liveness';

describe('liveness response handling', () => {
  it('accepts a completed V2 result', () => {
    expect(isSuccessfulLivenessResponse({
      success: true,
      liveness: { success: true }
    })).toBe(true);
  });

  it('does not treat a failed liveness result as success', () => {
    expect(isSuccessfulLivenessResponse({ success: true, passed: false })).toBe(false);
    expect(isSuccessfulLivenessResponse({
      success: false,
      liveness: { success: false }
    })).toBe(false);
  });
});
