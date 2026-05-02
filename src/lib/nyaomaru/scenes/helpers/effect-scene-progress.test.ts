import { describe, expect, it } from 'vitest';

import { getLocalSceneProgress } from '~/lib/nyaomaru/scenes/helpers/effect-scene-progress';

describe('effect scene progress', () => {
  it('normalizes local scene progress from a captured start point', () => {
    const result = getLocalSceneProgress({
      rawProgress: 0.6,
      startProgress: 0.2,
    });

    expect(result.progress).toBeCloseTo(0.4);
    expect(result.rawProgress).toBeCloseTo(0.4);
  });

  it('applies progress multipliers without losing overflow progress', () => {
    expect(
      getLocalSceneProgress({
        progressMultiplier: 1.5,
        rawProgress: 1.1,
        startProgress: 0.1,
      }),
    ).toEqual({
      progress: 1,
      rawProgress: 1.5,
    });
  });

  it('clamps negative movement at zero', () => {
    expect(
      getLocalSceneProgress({
        progressMultiplier: 2,
        rawProgress: 0.2,
        startProgress: 0.5,
      }),
    ).toEqual({
      progress: 0,
      rawProgress: 0,
    });
  });
});
