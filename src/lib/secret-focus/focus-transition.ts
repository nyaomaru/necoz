import { clamp } from '~/lib/math';

export const SECRET_FOCUS_START_SIZE_PX = 3000;
export const SECRET_FOCUS_END_SIZE_PX = 0;
export const SECRET_FOCUS_IN_DURATION_MS = 2000;
export const SECRET_LOADING_DURATION_MS = 2000;
export const SECRET_FOCUS_OUT_DURATION_MS = 2000;
export const SECRET_ENTRY_STORAGE_KEY = 'necoz-secret-entry';
export const SECRET_ENTRY_CLOSED_VALUE = 'closed';
export const SECRET_PAGE_PATH = '/secret/';

export const getSecretFocusSize = ({
  durationMs,
  elapsedMs,
  from,
  to,
}: {
  durationMs: number;
  elapsedMs: number;
  from: number;
  to: number;
}) => {
  if (durationMs <= 0) {
    return to;
  }

  const progress = clamp(elapsedMs / durationMs, 0, 1);

  return from + (to - from) * progress;
};
