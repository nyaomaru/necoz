import type { WalkerPose, WalkerScene } from '~/lib/nyaomaru/types';
import {
  HERO_FALL_EASING_POWER,
  MIN_SCROLL_DISTANCE,
  MOBILE_SCENE_PROGRESS_MULTIPLIER,
  MOTION_PORTIONS,
  MOBILE_LANDING_X_OFFSET,
  NYAOMARU_ADJUST_X_OFFSET,
  SELECTORS,
} from './model/hero';
import type { HeroSceneElements, HeroSceneLayout } from './model/hero';
import { getVisibleElement } from './helpers/dom';
import { getSegmentProgress, lerp } from './helpers/math';
import { getSceneScrollY, getVisualScrollY } from './helpers/scroll';
import { isMobileViewport } from './helpers/viewport';

const resolveHeroSceneElements = (): HeroSceneElements | null => {
  const start = document.querySelector<HTMLElement>(SELECTORS.start);
  const walker = document.querySelector<HTMLElement>('[data-nyaomaru-walker]');
  const target = getVisibleElement<HTMLElement>(SELECTORS.target);
  const block1 = getVisibleElement<HTMLElement>(SELECTORS.block1);
  const block2 = getVisibleElement<HTMLElement>(SELECTORS.block2);
  const block3 = getVisibleElement<HTMLElement>(SELECTORS.block3);
  const mobileTarget = getVisibleElement<HTMLElement>(SELECTORS.mobileTarget);

  if (!start || !walker || !block3 || !target || !block1 || !block2) {
    return null;
  }

  return { start, walker, target, block1, block2, block3, mobileTarget };
};

const measureHeroSceneLayout = ({
  start,
  walker,
  target,
  block1,
  block2,
  block3,
  mobileTarget,
}: HeroSceneElements) => {
  const visualScrollY = getVisualScrollY();
  const sceneScrollY = getSceneScrollY();
  const startRect = start.getBoundingClientRect();
  const walkerRect = walker.getBoundingClientRect();
  const walkerBaseY = Number.parseFloat(window.getComputedStyle(walker).top) || 0;
  const targetRect = (mobileTarget ?? target).getBoundingClientRect();
  const block1Rect = block1.getBoundingClientRect();
  const block2Rect = block2.getBoundingClientRect();
  const block3Rect = block3.getBoundingClientRect();
  const block3PageTop = block3Rect.top + visualScrollY;
  const heroSurfaceOffsetY = -(walkerBaseY + walkerRect.height - startRect.height);
  const startY = block1Rect.top - startRect.height + heroSurfaceOffsetY;
  const secondRunY = block2Rect.top - startRect.height + heroSurfaceOffsetY;
  const secondFallX = block2Rect.width - NYAOMARU_ADJUST_X_OFFSET;
  const landingY = targetRect.top - startRect.height + heroSurfaceOffsetY;
  const landingPageTop = targetRect.top + visualScrollY;
  const firstFallDistance = Math.abs(secondRunY - startY);
  const secondFallDistance = Math.abs(landingY - secondRunY);
  const totalFallDistance = Math.max(firstFallDistance + secondFallDistance, 1);
  const totalFallPortion = 1 - MOTION_PORTIONS.firstRun - MOTION_PORTIONS.secondRun;
  const firstFallPortion = totalFallPortion * (firstFallDistance / totalFallDistance);
  const sceneEndPageTop = mobileTarget ? Math.max(block3PageTop, landingPageTop) : block3PageTop;

  return {
    layout: {
      startX: startRect.left,
      startY,
      firstFallX: block1Rect.width - NYAOMARU_ADJUST_X_OFFSET,
      secondRunY,
      secondFallX,
      landingX: mobileTarget ? targetRect.left - MOBILE_LANDING_X_OFFSET : secondFallX,
      landingY,
      firstFallPortion,
      secondFallPortion: totalFallPortion - firstFallPortion,
    },
    scrollStart: 0,
    scrollEnd: Math.max(
      (sceneEndPageTop - sceneScrollY) /
        (isMobileViewport() ? MOBILE_SCENE_PROGRESS_MULTIPLIER : 1),
      MIN_SCROLL_DISTANCE,
    ),
  };
};

const getHeroScenePose = (
  progress: number,
  { layout }: { layout: HeroSceneLayout },
): WalkerPose => {
  const firstRunProgress = getSegmentProgress(progress, 0, MOTION_PORTIONS.firstRun);
  const firstFallStart = MOTION_PORTIONS.firstRun;
  const firstFallProgress = getSegmentProgress(progress, firstFallStart, layout.firstFallPortion);
  const secondRunStart = firstFallStart + layout.firstFallPortion;
  const secondRunProgress = getSegmentProgress(progress, secondRunStart, MOTION_PORTIONS.secondRun);
  const secondFallStart = secondRunStart + MOTION_PORTIONS.secondRun;
  const secondFallProgress = getSegmentProgress(
    progress,
    secondFallStart,
    layout.secondFallPortion,
  );

  if (progress >= 1) {
    return {
      x: layout.landingX,
      y: layout.landingY,
      phase: 'landed',
    };
  }

  if (progress > secondFallStart) {
    return {
      x: lerp(layout.secondFallX, layout.landingX, secondFallProgress),
      y: lerp(
        layout.secondRunY,
        layout.landingY,
        Math.pow(secondFallProgress, HERO_FALL_EASING_POWER),
      ),
      phase: 'second-fall',
    };
  }

  if (progress > secondRunStart) {
    return {
      x: lerp(layout.firstFallX, layout.secondFallX, secondRunProgress),
      y: layout.secondRunY,
      phase: 'second-run',
    };
  }

  if (progress > firstFallStart) {
    return {
      x: layout.firstFallX,
      y: lerp(
        layout.startY,
        layout.secondRunY,
        Math.pow(firstFallProgress, HERO_FALL_EASING_POWER),
      ),
      phase: 'first-fall',
    };
  }

  return {
    x: lerp(layout.startX, layout.firstFallX, firstRunProgress),
    y: layout.startY,
    phase: 'first-run',
  };
};

export const heroScene: WalkerScene<HeroSceneLayout> = {
  id: 'hero',
  measure: () => {
    const elements = resolveHeroSceneElements();

    if (!elements) {
      return null;
    }

    return measureHeroSceneLayout(elements);
  },
  getPose: getHeroScenePose,
};
