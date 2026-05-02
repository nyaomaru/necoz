import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getContactSceneReady,
  getSceneScrollY,
  getStudioSceneReady,
  getVisualScrollY,
  getWalkerOverride,
  setContactSceneReady,
  setScrollState,
  setStudioSceneReady,
  setWalkerOverride,
} from '~/lib/nyaomaru/runtime-state';

type RuntimeWindow = Window & {
  __necozContactSceneReady?: boolean;
  __necozSceneScrollY?: number;
  __necozScrollY?: number;
  __necozStudioSceneReady?: boolean;
  __necozWalkerOverride?: ReturnType<typeof getWalkerOverride>;
};

const runtimeWindow = window as RuntimeWindow;

describe('runtime state', () => {
  const originalScrollY = window.scrollY;

  beforeEach(() => {
    delete runtimeWindow.__necozContactSceneReady;
    delete runtimeWindow.__necozSceneScrollY;
    delete runtimeWindow.__necozScrollY;
    delete runtimeWindow.__necozStudioSceneReady;
    delete runtimeWindow.__necozWalkerOverride;

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: originalScrollY,
    });
  });

  afterEach(() => {
    delete runtimeWindow.__necozContactSceneReady;
    delete runtimeWindow.__necozSceneScrollY;
    delete runtimeWindow.__necozScrollY;
    delete runtimeWindow.__necozStudioSceneReady;
    delete runtimeWindow.__necozWalkerOverride;

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: originalScrollY,
    });
  });

  it('tracks visual and scene scroll independently', () => {
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 120,
    });

    expect(getVisualScrollY()).toBe(120);
    expect(getSceneScrollY()).toBe(120);

    setScrollState({
      sceneScrollY: 360,
      visualScrollY: 240,
    });

    expect(getVisualScrollY()).toBe(240);
    expect(getSceneScrollY()).toBe(360);
  });

  it('stores and clears walker overrides', () => {
    const override = {
      phase: 'landed',
      x: 32,
      y: 48,
      zIndex: 'var(--layer-test)',
    } as const;

    setWalkerOverride(override);
    expect(getWalkerOverride()).toEqual(override);

    setWalkerOverride(null);
    expect(getWalkerOverride()).toBeNull();
  });

  it('keeps scene readiness flags isolated', () => {
    expect(getStudioSceneReady()).toBe(false);
    expect(getContactSceneReady()).toBe(false);

    setStudioSceneReady(true);
    expect(getStudioSceneReady()).toBe(true);
    expect(getContactSceneReady()).toBe(false);

    setContactSceneReady(true);
    expect(getStudioSceneReady()).toBe(true);
    expect(getContactSceneReady()).toBe(true);
  });
});
