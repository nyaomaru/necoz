import { getSceneScrollY, getVisualScrollY } from './scroll';

export type EffectSceneFrameMetrics = {
  /** Clamped scene progress in the 0..1 range. */
  progress: number;
  /** Unclamped scene progress derived from the section scroll. */
  rawProgress: number;
  /** Walker CSS `left` baseline in pixels. */
  walkerBaseX: number;
  /** Walker CSS `top` baseline in pixels. */
  walkerBaseY: number;
  /** Walker sprite height in pixels. */
  walkerHeight: number;
  /** Walker sprite width in pixels. */
  walkerWidth: number;
};

export const measureEffectSceneFrame = ({
  anchor,
  progressMultiplier = 1,
  walker,
}: {
  anchor: HTMLElement;
  progressMultiplier?: number;
  walker: HTMLElement;
}) => {
  const visualScrollY = getVisualScrollY();
  const sceneScrollY = getSceneScrollY(visualScrollY);
  const anchorTop = anchor.getBoundingClientRect().top + visualScrollY - sceneScrollY;
  const viewportHeight = window.innerHeight;
  const rawProgress =
    Math.max((viewportHeight - anchorTop) / Math.max(viewportHeight, 1), 0) * progressMultiplier;
  const progress = Math.min(rawProgress, 1);
  const walkerRect = walker.getBoundingClientRect();
  const walkerComputedStyle = window.getComputedStyle(walker);

  return {
    progress,
    rawProgress,
    walkerBaseX: Number.parseFloat(walkerComputedStyle.left) || 0,
    walkerBaseY: Number.parseFloat(walkerComputedStyle.top) || 0,
    walkerHeight: walkerRect.height,
    walkerWidth: walkerRect.width,
  } satisfies EffectSceneFrameMetrics;
};
