import { describe, expect, it } from 'vitest';

import { clamp, getSegmentProgress, lerp } from '~/lib/nyaomaru/scenes/helpers/math';

describe('scene math helpers', () => {
  it('re-exports clamp', () => {
    expect(clamp(12, 0, 8)).toBe(8);
  });

  it('linearly interpolates values', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('normalizes segment progress and clamps its bounds', () => {
    expect(getSegmentProgress(10, 10, 5)).toBe(0);
    expect(getSegmentProgress(12.5, 10, 5)).toBe(0.5);
    expect(getSegmentProgress(20, 10, 5)).toBe(1);
    expect(getSegmentProgress(5, 10, 5)).toBe(0);
  });
});
