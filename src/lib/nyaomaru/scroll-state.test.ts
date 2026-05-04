import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getSceneScrollY, getVisualScrollY, setScrollState } from '~/lib/nyaomaru/scroll-state';

type ScrollWindow = Window & {
  __necozSceneScrollY?: number;
  __necozScrollY?: number;
};

const scrollWindow = window as ScrollWindow;

describe('scroll state', () => {
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
    expect(getSceneScrollY()).toBe(120);
  });

  it('tracks visual and scene scroll independently', () => {
    setScrollState({
      sceneScrollY: 360,
      visualScrollY: 240,
    });

    expect(getVisualScrollY()).toBe(240);
    expect(getSceneScrollY()).toBe(360);
  });

  it('falls back to the visual scroll value for scene scroll', () => {
    expect(getSceneScrollY(180)).toBe(180);
  });
});
