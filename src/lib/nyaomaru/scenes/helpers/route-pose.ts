import type { WalkerOverridePose, WalkerPhase } from '~/lib/nyaomaru/types';
import { clamp, lerp } from './math';

type RoutePoseSegment = {
  /** Optional jump arc height applied while traversing the segment. */
  arcHeight?: number;
  /** End X coordinate of the route segment. */
  endX: number;
  /** End Y coordinate of the route segment. */
  endY: number;
  /** Optional multiplier used to stretch or compress segment time. */
  lengthMultiplier?: number;
  /** Walker phase used while traversing this segment. */
  phase: WalkerPhase;
  /** Start X coordinate of the route segment. */
  startX: number;
  /** Start Y coordinate of the route segment. */
  startY: number;
  /** Optional z-index override used for layered route segments. */
  zIndex?: string;
};

type GetRoutePoseOptions<TSegment extends RoutePoseSegment> = {
  /** Returns the default z-index when a segment does not provide one. */
  getDefaultZIndex: (segment: TSegment) => string;
  /** Returns the default z-index after the route has completed. */
  getCompletedZIndex?: (segment: TSegment) => string;
  /** Allows scenes to override z-index for the active route segment. */
  resolveZIndex?: (args: { segment: TSegment; segmentProgress: number }) => string | undefined;
};

export const getRoutePose = <TSegment extends RoutePoseSegment>(
  segments: TSegment[],
  progress: number,
  { getCompletedZIndex, getDefaultZIndex, resolveZIndex }: GetRoutePoseOptions<TSegment>,
) => {
  if (segments.length === 0) {
    return null;
  }

  const lengths = segments.map(
    (segment) =>
      Math.max(Math.hypot(segment.endX - segment.startX, segment.endY - segment.startY), 1) *
      (segment.lengthMultiplier ?? 1),
  );
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  let traversedLength = clamp(progress, 0, 1) * totalLength;

  for (const [index, segment] of segments.entries()) {
    const segmentLength = lengths[index];

    if (traversedLength <= segmentLength) {
      const segmentProgress = clamp(traversedLength / segmentLength, 0, 1);
      const easedProgress =
        segment.phase === 'second-fall' ? segmentProgress * segmentProgress : segmentProgress;
      const jumpArc = segment.arcHeight ? 4 * segmentProgress * (1 - segmentProgress) : 0;

      return {
        phase: segment.phase,
        x: lerp(segment.startX, segment.endX, segmentProgress),
        y: lerp(segment.startY, segment.endY, easedProgress) - jumpArc * (segment.arcHeight ?? 0),
        zIndex:
          resolveZIndex?.({
            segment,
            segmentProgress,
          }) ??
          segment.zIndex ??
          getDefaultZIndex(segment),
      } satisfies WalkerOverridePose;
    }

    traversedLength -= segmentLength;
  }

  const lastSegment = segments.at(-1);

  if (!lastSegment) {
    return null;
  }

  return {
    phase: 'landed',
    x: lastSegment.endX,
    y: lastSegment.endY,
    zIndex:
      lastSegment.zIndex ?? getCompletedZIndex?.(lastSegment) ?? getDefaultZIndex(lastSegment),
  } satisfies WalkerOverridePose;
};
