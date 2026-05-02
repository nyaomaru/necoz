import { afterEach, describe, expect, it } from 'vitest';

import {
  getWalkerCenterX,
  getWalkerPastRightX,
  getWalkerStepLeftX,
  getWalkerSurfaceY,
} from '~/lib/nyaomaru/scenes/helpers/walker-geometry';

const setInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
};

describe('walker geometry helpers', () => {
  const originalInnerWidth = window.innerWidth;
  const frame = {
    walkerBaseX: 10,
    walkerBaseY: 20,
    walkerHeight: 40,
    walkerWidth: 30,
  };

  afterEach(() => {
    setInnerWidth(originalInnerWidth);
  });

  it('aligns the walker to element centers and edges', () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => new DOMRect(100, 200, 50, 60);

    expect(getWalkerCenterX(element, frame)).toBe(100);
    expect(getWalkerStepLeftX(element, frame, 0.8)).toBe(66);
    expect(getWalkerPastRightX(element, frame)).toBe(110);
  });

  it('optionally applies the mobile walker lift to surface alignment', () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => new DOMRect(0, 200, 50, 60);

    setInnerWidth(430);
    expect(
      getWalkerSurfaceY(element, frame, {
        applyMobileLift: true,
        effectOffsetY: 8,
        surfaceOffsetY: -6,
      }),
    ).toBe(141);

    setInnerWidth(800);
    expect(
      getWalkerSurfaceY(element, frame, {
        applyMobileLift: true,
        effectOffsetY: 8,
        surfaceOffsetY: -6,
      }),
    ).toBe(142);
  });
});
