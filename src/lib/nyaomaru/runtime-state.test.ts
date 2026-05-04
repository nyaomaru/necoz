import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getContactSceneReady,
  getStudioSceneReady,
  getWalkerOverride,
  setContactSceneReady,
  setStudioSceneReady,
  setWalkerOverride,
} from '~/lib/nyaomaru/runtime-state';

type RuntimeWindow = Window & {
  __necozContactSceneReady?: boolean;
  __necozStudioSceneReady?: boolean;
  __necozWalkerOverride?: ReturnType<typeof getWalkerOverride>;
};

const runtimeWindow = window as RuntimeWindow;

describe('runtime state', () => {
  beforeEach(() => {
    delete runtimeWindow.__necozContactSceneReady;
    delete runtimeWindow.__necozStudioSceneReady;
    delete runtimeWindow.__necozWalkerOverride;
  });

  afterEach(() => {
    delete runtimeWindow.__necozContactSceneReady;
    delete runtimeWindow.__necozStudioSceneReady;
    delete runtimeWindow.__necozWalkerOverride;
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
