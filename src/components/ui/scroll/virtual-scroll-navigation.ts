import { clamp } from '~/lib/math';
import { isEditableTarget, isInteractiveTarget } from '~/lib/is';

const KEYBOARD_SCROLL_STEP = 40;
const PAGE_SCROLL_RATIO = 0.9;

export { isEditableTarget, isInteractiveTarget };

export const getKeyboardScrollTarget = ({
  event,
  targetVirtualScrollY,
  virtualScrollRange,
}: {
  event: KeyboardEvent;
  targetVirtualScrollY: number;
  virtualScrollRange: number;
}) => {
  switch (event.key) {
    case 'ArrowDown':
      return targetVirtualScrollY + KEYBOARD_SCROLL_STEP;
    case 'ArrowUp':
      return targetVirtualScrollY - KEYBOARD_SCROLL_STEP;
    case 'PageDown':
      return targetVirtualScrollY + window.innerHeight * PAGE_SCROLL_RATIO;
    case 'PageUp':
      return targetVirtualScrollY - window.innerHeight * PAGE_SCROLL_RATIO;
    case 'Home':
      return 0;
    case 'End':
      return virtualScrollRange;
    case ' ':
      return (
        targetVirtualScrollY + window.innerHeight * PAGE_SCROLL_RATIO * (event.shiftKey ? -1 : 1)
      );
    default:
      return null;
  }
};

export const getHashTargetVirtualScrollY = ({
  anchor,
  baseScrollRange,
  currentVisualScrollY,
  getVirtualScrollYForVisualScrollY,
}: {
  anchor: HTMLAnchorElement;
  baseScrollRange: number;
  currentVisualScrollY: number;
  getVirtualScrollYForVisualScrollY: (visualScrollY: number) => number;
}) => {
  const hash = anchor.getAttribute('href');

  if (!hash || hash === '#') {
    return null;
  }

  const target = document.querySelector<HTMLElement>(hash);

  if (!target) {
    return null;
  }

  const targetVisualScrollY = clamp(
    currentVisualScrollY + target.getBoundingClientRect().top,
    0,
    baseScrollRange,
  );

  return getVirtualScrollYForVisualScrollY(targetVisualScrollY);
};
