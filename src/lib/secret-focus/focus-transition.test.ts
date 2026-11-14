import { describe, expect, it } from 'vitest';

import {
  SECRET_FOCUS_END_SIZE_PX,
  SECRET_FOCUS_IN_DURATION_MS,
  SECRET_FOCUS_START_SIZE_PX,
  getSecretFocusSize,
} from './focus-transition';

describe('getSecretFocusSize', () => {
  it('starts at the open size', () => {
    expect(
      getSecretFocusSize({
        durationMs: SECRET_FOCUS_IN_DURATION_MS,
        elapsedMs: 0,
        from: SECRET_FOCUS_START_SIZE_PX,
        to: SECRET_FOCUS_END_SIZE_PX,
      }),
    ).toBe(SECRET_FOCUS_START_SIZE_PX);
  });

  it('is halfway through a two second close', () => {
    expect(
      getSecretFocusSize({
        durationMs: SECRET_FOCUS_IN_DURATION_MS,
        elapsedMs: 1000,
        from: SECRET_FOCUS_START_SIZE_PX,
        to: SECRET_FOCUS_END_SIZE_PX,
      }),
    ).toBe(1500);
  });

  it('finishes at the closed size', () => {
    expect(
      getSecretFocusSize({
        durationMs: SECRET_FOCUS_IN_DURATION_MS,
        elapsedMs: 2500,
        from: SECRET_FOCUS_START_SIZE_PX,
        to: SECRET_FOCUS_END_SIZE_PX,
      }),
    ).toBe(SECRET_FOCUS_END_SIZE_PX);
  });

  it('jumps to the destination when motion duration is zero', () => {
    expect(
      getSecretFocusSize({
        durationMs: 0,
        elapsedMs: 0,
        from: SECRET_FOCUS_END_SIZE_PX,
        to: SECRET_FOCUS_START_SIZE_PX,
      }),
    ).toBe(SECRET_FOCUS_START_SIZE_PX);
  });
});
