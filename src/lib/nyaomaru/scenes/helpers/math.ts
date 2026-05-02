import { clamp } from '~/lib/math';

export { clamp };

export const lerp = (start: number, end: number, progress: number) =>
  start + (end - start) * progress;

export const getSegmentProgress = (progress: number, start: number, duration: number) =>
  clamp((progress - start) / duration, 0, 1);
