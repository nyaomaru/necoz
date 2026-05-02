import { afterEach, describe, expect, it } from 'vitest';

import {
  isMobileViewport,
  MOBILE_BREAKPOINT,
  MOBILE_WALKER_SURFACE_LIFT_Y,
} from '~/lib/nyaomaru/scenes/helpers/viewport';

const setInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
};

describe('scene viewport helpers', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    setInnerWidth(originalInnerWidth);
  });

  it('keeps shared mobile viewport constants stable', () => {
    expect(MOBILE_BREAKPOINT).toBe(430);
    expect(MOBILE_WALKER_SURFACE_LIFT_Y).toBe(-1);
  });

  it('treats the breakpoint width as mobile', () => {
    setInnerWidth(MOBILE_BREAKPOINT);
    expect(isMobileViewport()).toBe(true);
  });

  it('treats widths above the breakpoint as desktop', () => {
    setInnerWidth(MOBILE_BREAKPOINT + 1);
    expect(isMobileViewport()).toBe(false);
  });
});
