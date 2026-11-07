import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getBaseScrollRangeMultiplier,
  getFooterPinExtraScrollRange,
  getScrollRangeMultiplier,
} from './virtual-scroll-policy';
import {
  createVirtualScrollProfile,
  getScrollStateForVirtualScrollY,
} from './virtual-scroll-profile';
import { SCENE_DOM_ATTRIBUTES } from '~/lib/nyaomaru/scenes/dom-contracts';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('responsive scroll policy', () => {
  it.each([320, 375, 430])(
    'shortens phone scrolling at %i px while preserving progress',
    (width) => {
      vi.stubGlobal('innerWidth', width);
      vi.stubGlobal('innerHeight', 800);
      const contact = document.createElement('section');
      contact.setAttribute(SCENE_DOM_ATTRIBUTES.contact.scene, '');
      Object.defineProperty(contact, 'offsetTop', { value: 4000 });
      document.body.append(contact);

      const baseScrollRange = 2500;
      const baseMultiplier = getBaseScrollRangeMultiplier();
      const multiplier = getScrollRangeMultiplier();
      expect(baseMultiplier).toBeCloseTo(3.75 * 0.5 * 0.65);
      expect(multiplier).toBeCloseTo(7.5 * 0.5 * 0.65);
      const footerRange = getFooterPinExtraScrollRange(baseScrollRange);
      expect(footerRange).toBeGreaterThan(0);
      const makeProfile = (scale: number) =>
        createVirtualScrollProfile({
          baseScrollRange,
          baseScrollRangeMultiplier: baseMultiplier * scale,
          footerPinExtraScrollRange: footerRange * scale,
          scrollRangeMultiplier: multiplier * scale,
          sections: [
            { height: 800, offsetTop: 0 },
            { height: 1000, offsetTop: 800 },
            { height: 900, offsetTop: 1800 },
          ],
        });
      const mobile = makeProfile(1);
      const previous = makeProfile(1 / 0.65);

      expect(mobile.virtualScrollRange).toBeCloseTo(previous.virtualScrollRange * 0.65);
      for (const progress of [0, 0.2, 0.5, 0.8, 1]) {
        const actual = getScrollStateForVirtualScrollY(
          mobile,
          mobile.virtualScrollRange * progress,
        );
        const expected = getScrollStateForVirtualScrollY(
          previous,
          previous.virtualScrollRange * progress,
        );
        expect(actual.visualScrollY).toBeCloseTo(expected.visualScrollY);
        expect(actual.sceneScrollY).toBeCloseTo(expected.sceneScrollY);
      }
    },
  );

  it('keeps desktop multipliers unchanged above the phone breakpoint', () => {
    vi.stubGlobal('innerWidth', 431);
    expect(getBaseScrollRangeMultiplier()).toBe(3.75);
    expect(getScrollRangeMultiplier()).toBe(7.5);
  });
});
