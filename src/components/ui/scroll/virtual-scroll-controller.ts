import {
  getBaseScrollRangeMultiplier,
  getFooterPinExtraScrollRange,
  getScrollRangeMultiplier,
} from './virtual-scroll-policy';
import { clamp } from '~/lib/math';
import { setScrollState } from '~/lib/nyaomaru/runtime-state';
import {
  getHashTargetVirtualScrollY,
  getKeyboardScrollTarget,
  isEditableTarget,
  isInteractiveTarget,
} from './virtual-scroll-navigation';
import { isElement } from '~/lib/is';

const MIN_THUMB_HEIGHT = 48;
const SMOOTH_SCROLL_EASING = 0.15;
const SMOOTH_SCROLL_STOP_DISTANCE = 0.5;

export const setupVirtualScroll = () => {
  const content = document.querySelector<HTMLElement>('[data-virtual-scroll-content]');
  const track = document.querySelector<HTMLElement>('[data-virtual-scrollbar-track]');
  const thumb = document.querySelector<HTMLElement>('[data-virtual-scrollbar-thumb]');

  if (!content || !track || !thumb) {
    return;
  }

  let rafId = 0;
  let animationFrameId = 0;
  let baseScrollRange = 0;
  let virtualScrollRange = 0;
  let renderedVirtualScrollY = 0;
  let targetVirtualScrollY = 0;
  let activePointerId: number | null = null;
  let dragOffsetY = 0;
  let lastTouchY: number | null = null;
  let nativeTouchTargetActive = false;

  const getSceneScrollY = () => renderedVirtualScrollY / getBaseScrollRangeMultiplier();
  const getVisualScrollY = () =>
    clamp(renderedVirtualScrollY / getScrollRangeMultiplier(), 0, baseScrollRange);
  const updateThumb = () => {
    const trackHeight = track.clientHeight;
    const totalVirtualHeight = window.innerHeight + virtualScrollRange;
    const thumbHeight = clamp(
      trackHeight * (window.innerHeight / totalVirtualHeight),
      MIN_THUMB_HEIGHT,
      trackHeight,
    );
    const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);
    const thumbProgress = virtualScrollRange <= 0 ? 0 : renderedVirtualScrollY / virtualScrollRange;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${maxThumbOffset * thumbProgress}px)`;
  };
  const applyScroll = () => {
    const visualScrollY = getVisualScrollY();
    const sceneScrollY = getSceneScrollY();

    content.style.top = `${-visualScrollY}px`;
    setScrollState({ sceneScrollY, visualScrollY });
    window.dispatchEvent(new CustomEvent('necoz:virtual-scroll'));
    updateThumb();
  };
  const setImmediateVirtualScrollY = (nextVirtualScrollY: number) => {
    targetVirtualScrollY = clamp(nextVirtualScrollY, 0, virtualScrollRange);
    renderedVirtualScrollY = targetVirtualScrollY;
    applyScroll();
  };
  const startSmoothScroll = () => {
    if (animationFrameId !== 0) {
      return;
    }

    const step = () => {
      const distance = targetVirtualScrollY - renderedVirtualScrollY;

      if (Math.abs(distance) <= SMOOTH_SCROLL_STOP_DISTANCE) {
        renderedVirtualScrollY = targetVirtualScrollY;
        applyScroll();
        animationFrameId = 0;
        return;
      }

      renderedVirtualScrollY += distance * SMOOTH_SCROLL_EASING;
      applyScroll();
      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);
  };
  const setTargetVirtualScrollY = (nextVirtualScrollY: number) => {
    targetVirtualScrollY = clamp(nextVirtualScrollY, 0, virtualScrollRange);
    startSmoothScroll();
  };
  const syncMetrics = () => {
    const currentProgress = virtualScrollRange <= 0 ? 0 : targetVirtualScrollY / virtualScrollRange;
    const scrollRangeMultiplier = getScrollRangeMultiplier();

    content.style.top = '0px';
    baseScrollRange = Math.max(content.scrollHeight - window.innerHeight, 0);
    virtualScrollRange =
      baseScrollRange * scrollRangeMultiplier + getFooterPinExtraScrollRange(baseScrollRange);
    targetVirtualScrollY = currentProgress * virtualScrollRange;
    renderedVirtualScrollY = targetVirtualScrollY;
    applyScroll();
  };
  const requestSyncMetrics = () => {
    cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(syncMetrics);
  };
  const handleWheel = (event: WheelEvent) => {
    if (isEditableTarget(event.target) || virtualScrollRange <= 0) {
      return;
    }

    event.preventDefault();
    setTargetVirtualScrollY(targetVirtualScrollY + event.deltaY);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isEditableTarget(event.target) || virtualScrollRange <= 0) {
      return;
    }

    const nextVirtualScrollY = getKeyboardScrollTarget({
      event,
      targetVirtualScrollY,
      virtualScrollRange,
    });

    if (nextVirtualScrollY === null) {
      return;
    }

    event.preventDefault();
    setTargetVirtualScrollY(nextVirtualScrollY);
  };
  const handleDocumentClick = (event: MouseEvent) => {
    const anchor = isElement(event.target)
      ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
      : null;

    if (!anchor) {
      return;
    }

    const targetVirtualScrollY = getHashTargetVirtualScrollY({
      anchor,
      baseScrollRange,
      currentVisualScrollY: getVisualScrollY(),
      scrollRangeMultiplier: getScrollRangeMultiplier(),
    });

    if (targetVirtualScrollY === null) {
      return;
    }

    event.preventDefault();
    setTargetVirtualScrollY(targetVirtualScrollY);
  };
  const handleTrackPointerDown = (event: PointerEvent) => {
    if (event.target === thumb) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const thumbCenterY = event.clientY - trackRect.top - thumbRect.height / 2;
    const maxThumbOffset = Math.max(trackRect.height - thumbRect.height, 1);
    const nextProgress = clamp(thumbCenterY / maxThumbOffset, 0, 1);

    setTargetVirtualScrollY(nextProgress * virtualScrollRange);
  };
  const handleThumbPointerDown = (event: PointerEvent) => {
    const thumbRect = thumb.getBoundingClientRect();

    activePointerId = event.pointerId;
    dragOffsetY = event.clientY - thumbRect.top;
    thumb.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const handleThumbPointerMove = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const maxThumbOffset = Math.max(trackRect.height - thumbRect.height, 1);
    const nextThumbOffset = clamp(event.clientY - trackRect.top - dragOffsetY, 0, maxThumbOffset);

    setImmediateVirtualScrollY((nextThumbOffset / maxThumbOffset) * virtualScrollRange);
  };
  const handleThumbPointerEnd = (event: PointerEvent) => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    activePointerId = null;
    thumb.releasePointerCapture(event.pointerId);
  };
  const handleTouchStart = (event: TouchEvent) => {
    nativeTouchTargetActive = isInteractiveTarget(event.target);

    if (nativeTouchTargetActive || isEditableTarget(event.target)) {
      lastTouchY = null;
      return;
    }

    lastTouchY = event.touches[0]?.clientY ?? null;
  };
  const handleTouchMove = (event: TouchEvent) => {
    if (nativeTouchTargetActive || isEditableTarget(event.target) || lastTouchY === null) {
      return;
    }

    const touchY = event.touches[0]?.clientY;

    if (touchY === undefined) {
      return;
    }

    event.preventDefault();
    setTargetVirtualScrollY(targetVirtualScrollY + (lastTouchY - touchY));
    lastTouchY = touchY;
  };
  const handleTouchEnd = () => {
    nativeTouchTargetActive = false;
    lastTouchY = null;
  };

  requestSyncMetrics();
  window.addEventListener('resize', requestSyncMetrics, { passive: true });
  window.addEventListener('load', requestSyncMetrics);
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  document.addEventListener('click', handleDocumentClick);
  track.addEventListener('pointerdown', handleTrackPointerDown);
  thumb.addEventListener('pointerdown', handleThumbPointerDown);
  thumb.addEventListener('pointermove', handleThumbPointerMove);
  thumb.addEventListener('pointerup', handleThumbPointerEnd);
  thumb.addEventListener('pointercancel', handleThumbPointerEnd);
};
