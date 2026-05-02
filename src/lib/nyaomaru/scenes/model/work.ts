import type { WalkerOverridePose } from '~/lib/nyaomaru/types';

export type WorkAnchor = HTMLElement & {
  /** Cleanup handler for the scroll-linked work scene listeners. */
  __workSceneCleanup__?: () => void;
};

export type WalkerRoot = HTMLElement;

export type RectBounds = {
  /** Left edge in viewport pixels. */
  left: number;
  /** Top edge in viewport pixels. */
  top: number;
  /** Right edge in viewport pixels. */
  right: number;
  /** Bottom edge in viewport pixels. */
  bottom: number;
};

export type WorkSceneElements = {
  /** Phase anchor that owns the scene lifecycle. */
  anchor: WorkAnchor;
  /** Visible top row of the `block-three` stack. */
  blockThreeFirstRow: HTMLElement;
  /** Visible third row of the `block-three` stack. */
  blockThreeThirdRow: HTMLElement;
  /** Visible phase-controlled stacks that can display the scene on each breakpoint. */
  phaseTargets: WorkAnchor[];
  /** Mobile plumber target used as the active floor on smartphones. */
  mobileBlockTarget: HTMLElement | null;
  /** Mobile-only floor edge used to stop the work icon before it leaves `block-two-1`. */
  mobileWorkClampTarget: HTMLElement | null;
  /** Exit pipe wrapper above `block-four`. */
  blockFourExit: HTMLElement;
  /** Stair-step segments that nyaomaru descends after exiting `block-four`. */
  blockFourSteps: HTMLElement[];
  /** First non-empty cell of `block-three-1`, used as the left clamp target. */
  blockThreeTarget: HTMLElement;
  /** Pipe sprite that the work icon emerges from. */
  plumberIcon: HTMLImageElement;
  /** Desk icon used as the final landing target in the studio section. */
  studioDesk: HTMLImageElement;
  /** Shot sprite fired by nyaomaru. */
  shotIcon: HTMLElement;
  /** Fixed-position nyaomaru walker root. */
  walker: WalkerRoot;
  /** Work icon that gets hit by the shot. */
  workIcon: HTMLImageElement;
  /** Relative positioning wrapper for the work icon stack. */
  workStack: HTMLElement;
};

export type CollisionState = {
  /** Final-phase progress captured at the first collision frame. */
  collidedFinalLeftShiftProgress: number | null;
  /** Frozen walker route metrics captured at collision time. */
  collisionMotionSnapshot: CollisionMotionSnapshot | null;
  /** Walker translate X captured at collision time. */
  collidedWalkerX: number | null;
  /** Walker translate Y captured at collision time. */
  collidedWalkerY: number | null;
  /** Work icon translate X captured at collision time. */
  collidedWorkX: number | null;
  /** Whether the shot has already collided in the current cycle. */
  hasShotCollided: boolean;
};

export type WorkFrameMetrics = {
  /** Base left position of the work icon before runtime translation. */
  baseWorkLeft: number;
  /** Base top position of the work icon before runtime translation. */
  baseWorkTop: number;
  /** Settled Y after the work icon has descended onto the pipe. */
  descendedY: number;
  /** Normalized progress for the descend phase. */
  descendProgress: number;
  /** Normalized progress for the emerge phase. */
  emergeProgress: number;
  /** Hidden emerge Y offset while the icon is still inside the pipe. */
  emergeY: number;
  /** Overflow progress used after the main scene progress reaches 1. */
  finalLeftShiftProgress: number;
  /** Offscreen Y used while the work icon is hidden. */
  hiddenY: number;
  /** Normalized progress for the initial left-shift phase. */
  leftShiftProgress: number;
  /** Horizontal distance from centered pipe position to landed pipe edge. */
  leftShiftX: number;
  /** Current pipe bounds. */
  plumberRect: DOMRect;
  /** Clamped scene progress in the 0..1 range. */
  progress: number;
  /** Unclamped scene progress used for extended final motion. */
  rawProgress: number;
  /** Extra burst-sprite X translation for the shot trail. */
  shotBurstOffsetX: number;
  /** Current shot sprite bounds. */
  shotRect: DOMRect;
  /** Shot base X position. */
  shotX: number;
  /** Shot base Y position. */
  shotY: number;
  /** Work icon X when centered on the pipe before later offsets. */
  stackX: number;
  /** Furthest left X allowed for the work icon. */
  targetLeftClampX: number;
  /** Walker CSS `left` baseline in pixels. */
  walkerBaseX: number;
  /** Walker CSS `top` baseline in pixels. */
  walkerBaseY: number;
  /** Walker sprite height in pixels. */
  walkerHeight: number;
  /** Current walker bounds. */
  walkerRect: DOMRect;
  /** Walker translate X extracted from its current transform. */
  walkerTranslateX: number;
  /** Walker translate Y extracted from its current transform. */
  walkerTranslateY: number;
  /** Current work icon bounds. */
  workRect: DOMRect;
};

export type WorkSceneActions = {
  /** Hides the shot sprite without resetting its transform values. */
  hideShot: () => void;
  /** Resets shot translation state and hides it. */
  resetShot: () => void;
  /** Clears walker override state and collision-cached walker coordinates. */
  resetWalkerOverride: () => void;
  /** Positions the shot sprites for the current frame. */
  setShotPosition: (x: number, y: number, burstOffsetX: number) => void;
  /** Pushes an override pose into the walker controller. */
  setWalkerOverride: (override: WalkerOverridePose | null) => void;
  /** Toggles whether the follow-up studio scene may take over walker motion. */
  setStudioSceneReady: (ready: boolean) => void;
  /** Updates CSS custom properties used to place the work icon. */
  setWorkPosition: (x: number, y: number) => void;
};

export type WalkerRouteSegment = {
  /** Optional jump arc height applied while traversing the segment. */
  arcHeight?: number;
  /** End X coordinate of the route segment. */
  endX: number;
  /** End Y coordinate of the route segment. */
  endY: number;
  /** Walker phase used while traversing this segment. */
  phase: 'landed' | 'second-run' | 'second-fall';
  /** Start X coordinate of the route segment. */
  startX: number;
  /** Start Y coordinate of the route segment. */
  startY: number;
  /** Optional z-index override used for layered route segments. */
  zIndex?: string;
};

export type CollisionMotionSnapshot = {
  /** Fixed route segments used after nyaomaru enters the follow-up block-four path. */
  blockFourRouteSegments: WalkerRouteSegment[];
  /** Fixed Y coordinate for nyaomaru standing on the active floor. */
  walkerRunY: number;
  /** Fixed X coordinate for the plumber landing point. */
  plumberLandingX: number;
  /** Fixed Y coordinate for the plumber landing point. */
  plumberLandingY: number;
  /** Fixed Y coordinate for the enter-pipe motion after landing. */
  walkerEnterY: number;
};

export const STACK_WORK_ICON_X_RATIO = 0.25;
export const FULL_PROGRESS = 1;
export const EMERGE_PHASE_END = 1 / 3;
export const LEFT_SHIFT_PHASE_END = 1 / 2;
export const DESCEND_PHASE_END = 3 / 5;
export const CENTER_RATIO = 0.5;
export const EMERGE_DISTANCE_RATIO = 0.9;
export const PLUMBING_OFFSET_Y = 12;
export const SHOT_OFFSET_X = 32;
export const MOBILE_SHOT_OFFSET_X = 8;
export const SHOT_BURST_TRAVEL_RATIO = 10;
export const FINAL_WORK_LEFT_SHIFT_RATIO = 2;
export const COLLISION_SHAKE_PROGRESS = 0.2;
export const COLLISION_STOP_PROGRESS = 0.2;
export const COLLISION_SHAKE_CYCLES = 1.5;
export const COLLISION_SHAKE_DISTANCE_RATIO = 0.8;
export const WALKER_PROGRESS_SPEED_RATIO = 0.125;
export const WALKER_MIN_POST_COLLISION_PROGRESS_RANGE = 0.2;
export const WALKER_APPROACH_PHASE_END = 0.5;
export const WALKER_JUMP_PHASE_END = 0.5;
export const WALKER_APPROACH_RATIO = 0.25;
export const WALKER_JUMP_HEIGHT_RATIO = 1.25;
export const WALKER_RUN_SURFACE_OFFSET_Y = -6;
export const WALKER_EFFECT_Y_OFFSET = 8;
export const WALKER_PLUMBER_LANDING_OFFSET_Y = 4;
export const WALKER_PLUMBER_ENTER_RATIO = 1.1;
export const WALKER_BLOCK_FOUR_PATH_PROGRESS_RATIO = 2 / 3;
export const WALKER_PLUMBER_DWELL_PROGRESS = 0.35;
export const WALKER_PLUMBER_DWELL_DURATION_RATIO = 2 / 3;
export const STUDIO_DESK_LANDING_X_OFFSET = 4;
export const STUDIO_DESK_LANDING_Y_RATIO = 0.75;
export const STUDIO_DESK_LANDING_Y_OFFSET = -24;
export const STUDIO_DESK_JUMP_HEIGHT_RATIO = 1.4;
export const PLUMBER_LANDING_OFFSET_Y = 4;
export const PLUMBER_LANDING_OFFSET_X = 4;
export const WORK_COLLISION_TARGET_WIDTH_RATIO = 0.4;
export const SHOT_REVEAL_START_PROGRESS = 0.2;
export const SHOT_COLLISION_START_PROGRESS = 0.08;
export const MOBILE_SHOT_REVEAL_START_PROGRESS = 0.16;
export const MOBILE_SHOT_COLLISION_START_PROGRESS = 0.16;
export const MOBILE_SCENE_PROGRESS_MULTIPLIER = 1.5625;
export const MOBILE_WALKER_PROGRESS_SPEED_RATIO = 0.72;
export const MOBILE_WALKER_BLOCK_FOUR_PATH_PROGRESS_RATIO = 0.45;
export const MOBILE_WALKER_PLUMBER_DWELL_PROGRESS = 0.08;
export const MOBILE_WALKER_APPROACH_RATIO = 0;
export const MOBILE_WALKER_JUMP_HEIGHT_RATIO = 1.8;
export const MOBILE_COLLISION_SHAKE_DISTANCE_RATIO = COLLISION_SHAKE_DISTANCE_RATIO / 2;
export const RESPONSIVE_WALKER_PROGRESS_REFERENCE_WIDTH = 1200;
export const RESPONSIVE_WALKER_PROGRESS_MIN_WIDTH = 640;
export const RESPONSIVE_WALKER_PROGRESS_REFERENCE_HEIGHT = 800;
export const RESPONSIVE_WALKER_PROGRESS_MIN_HEIGHT = 600;
export const RESPONSIVE_WALKER_COMPACT_HEIGHT_DAMPING_RATIO = 0.6;
export const RESPONSIVE_WALKER_PROGRESS_SPEED_MAX_RATIO = 0.42;
export const RESPONSIVE_WALKER_BLOCK_FOUR_PATH_MAX_PROGRESS_RATIO = 1.1;
export const RESPONSIVE_WALKER_PLUMBER_DWELL_MIN_PROGRESS = 0.12;
