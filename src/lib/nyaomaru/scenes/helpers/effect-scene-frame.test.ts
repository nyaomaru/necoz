import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { measureEffectSceneFrame } from '~/lib/nyaomaru/scenes/helpers/effect-scene-frame';

type ScrollWindow = Window & {
  __necozSceneScrollY?: number;
  __necozScrollY?: number;
};

const scrollWindow = window as ScrollWindow;

const setInnerHeight = (value: number) => {
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value,
  });
};

describe('effect scene frame helper', () => {
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    delete scrollWindow.__necozSceneScrollY;
    delete scrollWindow.__necozScrollY;
  });

  afterEach(() => {
    delete scrollWindow.__necozSceneScrollY;
    delete scrollWindow.__necozScrollY;
    setInnerHeight(originalInnerHeight);
  });

  it('measures normalized progress and walker metrics', () => {
    setInnerHeight(600);

    const anchor = document.createElement('div');
    anchor.getBoundingClientRect = () => new DOMRect(0, 150, 0, 0);

    const walker = document.createElement('div');
    walker.style.left = '12px';
    walker.style.top = '24px';
    walker.getBoundingClientRect = () => new DOMRect(0, 0, 48, 64);

    expect(measureEffectSceneFrame({ anchor, walker })).toEqual({
      progress: 0.75,
      rawProgress: 0.75,
      walkerBaseX: 12,
      walkerBaseY: 24,
      walkerHeight: 64,
      walkerWidth: 48,
    });
  });

  it('supports virtual scene scroll overrides and progress multipliers', () => {
    setInnerHeight(500);
    scrollWindow.__necozScrollY = 200;
    scrollWindow.__necozSceneScrollY = 80;

    const anchor = document.createElement('div');
    anchor.getBoundingClientRect = () => new DOMRect(0, -20, 0, 0);

    const walker = document.createElement('div');
    walker.getBoundingClientRect = () => new DOMRect(0, 0, 20, 30);

    expect(
      measureEffectSceneFrame({
        anchor,
        progressMultiplier: 2,
        walker,
      }),
    ).toEqual({
      progress: 1,
      rawProgress: 1.6,
      walkerBaseX: 0,
      walkerBaseY: 0,
      walkerHeight: 30,
      walkerWidth: 20,
    });
  });
});
