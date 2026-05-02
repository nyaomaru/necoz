import { clamp } from '~/lib/math';

export const getLocalSceneProgress = ({
  progressMultiplier = 1,
  rawProgress,
  startProgress,
}: {
  progressMultiplier?: number;
  rawProgress: number;
  startProgress: number;
}) => {
  const localRawProgress = Math.max(rawProgress - startProgress, 0) * progressMultiplier;

  return {
    progress: clamp(localRawProgress, 0, 1),
    rawProgress: localRawProgress,
  };
};
