import { describe, expect, it } from 'vitest';
import { WALKER_LAYER_BEHIND_CONTENT, WALKER_LAYER_IN_STRUCTURE } from './helpers/layers';
import { getWalkerRoutePose } from './work-scene-route';
import type { WalkerRouteSegment } from './model/work';

describe('desk landing', () => {
  it('moves the desk in front near the end of the jump, including when reversing', () => {
    const segments: WalkerRouteSegment[] = [
      {
        arcHeight: 30,
        startX: 0,
        startY: 0,
        endX: 100,
        endY: 0,
        phase: 'second-fall',
        zIndex: WALKER_LAYER_BEHIND_CONTENT,
      },
      {
        startX: 100,
        startY: 0,
        endX: 100,
        endY: 0,
        phase: 'landed',
        zIndex: WALKER_LAYER_IN_STRUCTURE,
      },
    ];

    expect(getWalkerRoutePose(segments, 0.5)?.zIndex).toBe(WALKER_LAYER_BEHIND_CONTENT);
    expect(getWalkerRoutePose(segments, 0.8)?.zIndex).toBe(WALKER_LAYER_IN_STRUCTURE);
    expect(getWalkerRoutePose(segments, 0.5)?.zIndex).toBe(WALKER_LAYER_BEHIND_CONTENT);
  });
});
