import { describe, expect, it } from 'vitest';

import { clamp } from '~/lib/math';

describe('clamp', () => {
  it('returns the value when it is already within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps values below the minimum', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  it('clamps values above the maximum', () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});
