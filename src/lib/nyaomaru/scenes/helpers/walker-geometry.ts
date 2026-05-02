import { isMobileViewport, MOBILE_WALKER_SURFACE_LIFT_Y } from './viewport';

type WalkerGeometryFrame = {
  walkerBaseX: number;
  walkerBaseY: number;
  walkerHeight: number;
  walkerWidth: number;
};

export const getWalkerSurfaceY = (
  element: HTMLElement,
  frame: WalkerGeometryFrame,
  {
    applyMobileLift = false,
    effectOffsetY,
    surfaceOffsetY,
  }: {
    applyMobileLift?: boolean;
    effectOffsetY: number;
    surfaceOffsetY: number;
  },
) =>
  element.getBoundingClientRect().top +
  surfaceOffsetY -
  frame.walkerHeight -
  frame.walkerBaseY +
  effectOffsetY +
  (applyMobileLift && isMobileViewport() ? MOBILE_WALKER_SURFACE_LIFT_Y : 0);

export const getWalkerCenterX = (
  element: HTMLElement,
  frame: WalkerGeometryFrame,
  centerRatio = 0.5,
) => {
  const rect = element.getBoundingClientRect();

  return rect.left + rect.width * centerRatio - frame.walkerWidth * centerRatio - frame.walkerBaseX;
};

export const getWalkerStepLeftX = (
  element: HTMLElement,
  frame: WalkerGeometryFrame,
  widthRatio: number,
) => element.getBoundingClientRect().left - frame.walkerBaseX - frame.walkerWidth * widthRatio;

export const getWalkerPastRightX = (element: HTMLElement, frame: WalkerGeometryFrame) =>
  element.getBoundingClientRect().right - frame.walkerWidth - frame.walkerBaseX;
