import { describe, expect, it } from 'vitest';

import {
  createVirtualScrollProfile,
  getScrollStateForVirtualScrollY,
  getVirtualScrollYForVisualScrollY,
} from './virtual-scroll-profile';

const createDesktopProfile = () =>
  createVirtualScrollProfile({
    baseScrollRange: 2214,
    baseScrollRangeMultiplier: 3.75,
    footerPinExtraScrollRange: 13_860,
    scrollRangeMultiplier: 7.5,
    sections: [
      { height: 617, offsetTop: 295 },
      { height: 702, offsetTop: 911 },
      { height: 750, offsetTop: 1613 },
      { height: 768, offsetTop: 2364 },
    ],
  });

describe('virtual scroll profile', () => {
  it('reduces the complete scroll range to three quarters', () => {
    const profile = createDesktopProfile();
    const uncompressedRange = 2214 * 7.5 + 13_860;

    expect(profile.virtualScrollRange).toBeCloseTo(uncompressedRange * 0.75, 6);
  });

  it('compresses taller sections more without making any section abnormally fast', () => {
    const profile = createDesktopProfile();
    const compressions = [
      ...profile.segments.map(({ compression }) => compression),
      profile.footerCompression,
    ];

    expect(compressions).toEqual([...compressions].sort((left, right) => right - left));
    expect(Math.min(...compressions)).toBeGreaterThanOrEqual(0.7);
    expect(Math.max(...compressions)).toBeLessThanOrEqual(0.9);
  });

  it('preserves visual and scene destinations across the compressed mapping', () => {
    const profile = createDesktopProfile();
    const finalState = getScrollStateForVirtualScrollY(profile, profile.virtualScrollRange);

    expect(finalState.visualScrollY).toBe(2214);
    expect(finalState.sceneScrollY).toBeCloseTo(8124, 6);

    for (const visualScrollY of [0, 500, 1200, 2000, 2214]) {
      const virtualScrollY = getVirtualScrollYForVisualScrollY(profile, visualScrollY);
      const mappedState = getScrollStateForVirtualScrollY(profile, virtualScrollY);

      expect(mappedState.visualScrollY).toBeCloseTo(visualScrollY, 6);
      expect(mappedState.sceneScrollY).toBeCloseTo(visualScrollY * 2, 6);
    }
  });

  it('falls back to a uniform profile when section measurements are unavailable', () => {
    const profile = createVirtualScrollProfile({
      baseScrollRange: 1000,
      baseScrollRangeMultiplier: 2,
      footerPinExtraScrollRange: 0,
      scrollRangeMultiplier: 4,
      sections: [],
    });

    expect(profile.segments).toHaveLength(1);
    expect(profile.segments[0]?.compression).toBeCloseTo(0.75, 6);
    expect(profile.virtualScrollRange).toBeCloseTo(3000, 6);
  });
});
