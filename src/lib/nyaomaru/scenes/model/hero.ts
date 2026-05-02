export const MOTION_PORTIONS = {
  firstRun: 0.3,
  secondRun: 0.2,
} as const;

export const SELECTORS = {
  start: '[data-nyaomaru-start]',
  target: '[data-nyaomaru-target]',
  mobileTarget: '[data-nyaomaru-mobile-target]',
  block1: '[data-nyaomaru-block-1]',
  block2: '[data-nyaomaru-block-2]',
  block3: '[data-nyaomaru-block-3]',
} as const;

export const MIN_SCROLL_DISTANCE = 1;
export const NYAOMARU_ADJUST_X_OFFSET = 16;
export const MOBILE_LANDING_X_OFFSET = 16;
export const HERO_FALL_EASING_POWER = 1.5;
export const MOBILE_SCENE_PROGRESS_MULTIPLIER = 1.5625;

export type HeroSceneElements = {
  /** Hidden sprite anchor used as the hero scene start point. */
  start: HTMLElement;
  /** Fixed-position nyaomaru walker root. */
  walker: HTMLElement;
  /** Landing target block for the walker at the end of the hero scene. */
  target: HTMLElement;
  /** First block platform that the walker runs onto. */
  block1: HTMLElement;
  /** Second block platform that the walker runs across before landing. */
  block2: HTMLElement;
  /** Last hero block that defines the handoff point into the next scene. */
  block3: HTMLElement;
  /** Optional mobile-only landing target used instead of the work section handoff. */
  mobileTarget: HTMLElement | null;
};

export type HeroSceneLayout = {
  /** Initial X coordinate for the first run segment. */
  startX: number;
  /** Shared Y coordinate for the opening run segment. */
  startY: number;
  /** X coordinate where the first fall starts and the second platform begins. */
  firstFallX: number;
  /** Y coordinate of the second platform run segment. */
  secondRunY: number;
  /** X coordinate where the second fall starts. */
  secondFallX: number;
  /** Final landing X coordinate after the second jump. */
  landingX: number;
  /** Final landing Y coordinate on the target block. */
  landingY: number;
  /** Portion of total progress assigned to the first falling arc. */
  firstFallPortion: number;
  /** Portion of total progress assigned to the second falling arc. */
  secondFallPortion: number;
};
