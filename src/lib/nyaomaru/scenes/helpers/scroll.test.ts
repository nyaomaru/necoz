import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getSceneScrollY, getVisualScrollY } from '~/lib/nyaomaru/scenes/helpers/scroll';

type ScrollWindow = Window & {
  __necozSceneScrollY?: number;
  __necozScrollY?: number;
};

const scrollWindow = window as ScrollWindow;

describe('scene scroll helpers', () => {
  const originalScrollY = window.scrollY;

  beforeEach(() => {
    delete scrollWindow.__necozSceneScrollY;
    delete scrollWindow.__necozScrollY;

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: originalScrollY,
    });
  });

  afterEach(() => {
    delete scrollWindow.__necozSceneScrollY;
    delete scrollWindow.__necozScrollY;

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: originalScrollY,
    });
  });

  it('falls back to the browser scroll position for visual scroll', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 120,
    });

    expect(getVisualScrollY()).toBe(120);
  });

  it('prefers the custom visual scroll override when present', () => {
    scrollWindow.__necozScrollY = 240;

    expect(getVisualScrollY()).toBe(240);
  });

  it('prefers the custom scene scroll override when present', () => {
    scrollWindow.__necozSceneScrollY = 360;

    expect(getSceneScrollY(240)).toBe(360);
  });

  it('falls back to the visual scroll value for scene scroll', () => {
    expect(getSceneScrollY(180)).toBe(180);
  });
});
