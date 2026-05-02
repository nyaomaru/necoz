import { describe, expect, it } from 'vitest';

import { getRoutePose } from '~/lib/nyaomaru/scenes/helpers/route-pose';

describe('route pose helper', () => {
  it('weights traversal by segment length multipliers', () => {
    const pose = getRoutePose(
      [
        {
          endX: 10,
          endY: 0,
          lengthMultiplier: 2,
          phase: 'second-run',
          startX: 0,
          startY: 0,
        },
        {
          endX: 10,
          endY: 10,
          phase: 'second-fall',
          startX: 10,
          startY: 0,
        },
      ],
      0.5,
      {
        getDefaultZIndex: () => 'default-layer',
      },
    );

    expect(pose).toEqual({
      phase: 'second-run',
      x: 7.5,
      y: 0,
      zIndex: 'default-layer',
    });
  });

  it('applies fall easing and jump arcs within a segment', () => {
    const pose = getRoutePose(
      [
        {
          arcHeight: 4,
          endX: 10,
          endY: 10,
          phase: 'second-fall',
          startX: 0,
          startY: 0,
        },
      ],
      0.5,
      {
        getDefaultZIndex: () => 'default-layer',
      },
    );

    expect(pose).toEqual({
      phase: 'second-fall',
      x: 5,
      y: -1.5,
      zIndex: 'default-layer',
    });
  });

  it('uses active z-index resolvers ahead of segment defaults', () => {
    const segment = {
      endX: 8,
      endY: 4,
      phase: 'landed' as const,
      startX: 0,
      startY: 4,
      zIndex: 'segment-layer',
    };

    const activePose = getRoutePose([segment], 0.5, {
      getDefaultZIndex: () => 'default-layer',
      resolveZIndex: () => 'active-layer',
    });
    const fallbackPose = getRoutePose([segment], 0.5, {
      getDefaultZIndex: () => 'default-layer',
    });

    expect(activePose).toEqual({
      phase: 'landed',
      x: 4,
      y: 4,
      zIndex: 'active-layer',
    });
    expect(fallbackPose).toEqual({
      phase: 'landed',
      x: 4,
      y: 4,
      zIndex: 'segment-layer',
    });
  });
});
