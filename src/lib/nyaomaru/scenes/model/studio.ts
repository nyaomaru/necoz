export type StudioAnchor = HTMLElement & {
  /** Cleanup handler for the scroll-linked studio scene listeners. */
  __studioSceneCleanup__?: () => void;
  /** Raw scene progress captured when the studio scene becomes active. */
  __studioSceneStartProgress__?: number;
};

export type WalkerRoot = HTMLElement;

export type StudioSceneElements = {
  /** Section root that owns the studio scene lifecycle. */
  anchor: StudioAnchor;
  /** Top visible question block used as the poop run surface. */
  blockFiveTarget: HTMLElement;
  /** Ordered walker targets on the visible question block. */
  blockFiveSteps: HTMLElement[];
  /** Ordered walker targets on `block-seven`. */
  blockSevenSteps: HTMLElement[];
  /** Ordered stair-step surfaces on the visible desk-side block. */
  blockFourSteps: HTMLElement[];
  /** Heart icon thrown from behind manya. */
  heartIcon: HTMLImageElement;
  /** Manya icon that reacts after nyaomaru lands on `block-seven`. */
  manyaIcon: HTMLImageElement;
  /** Poop icon that rises out of the question box after the hit. */
  poopIcon: HTMLImageElement;
  /** Question-mark icon used as the final horizontal target above the visible question block. */
  questionMark: HTMLImageElement;
  /** Desk icon where nyaomaru starts this scene. */
  studioDesk: HTMLImageElement;
  /** Fixed-position nyaomaru walker root. */
  walker: WalkerRoot;
};

export type StudioFrameMetrics = {
  /** Clamped scene progress in the 0..1 range. */
  progress: number;
  /** Unclamped scene progress derived from the studio section scroll. */
  rawProgress: number;
  /** Walker CSS `left` baseline in pixels. */
  walkerBaseX: number;
  /** Walker CSS `top` baseline in pixels. */
  walkerBaseY: number;
  /** Walker sprite height in pixels. */
  walkerHeight: number;
  /** Walker sprite width in pixels. */
  walkerWidth: number;
};

export type StudioRouteSegment = {
  /** Optional jump arc height applied while traversing the segment. */
  arcHeight?: number;
  /** End X coordinate of the route segment. */
  endX: number;
  /** End Y coordinate of the route segment. */
  endY: number;
  /** Walker phase used while traversing this segment. */
  phase: "landed" | "second-run" | "second-fall";
  /** Start X coordinate of the route segment. */
  startX: number;
  /** Start Y coordinate of the route segment. */
  startY: number;
  /** Optional z-index override used for layered route segments. */
  zIndex?: string;
};

export const FULL_PROGRESS = 1;
export const CENTER_RATIO = 0.5;
export const STUDIO_HOLD_PROGRESS = 0.18;
export const STUDIO_MOVE_END_PROGRESS = 0.72;
export const STUDIO_HIT_END_PROGRESS = 0.86;
export const STUDIO_POOP_PROGRESS_SPEED_RATIO = 1 / 3;
export const STUDIO_POOP_RISE_END_PROGRESS = 0.35;
export const STUDIO_POOP_SLIDE_END_PROGRESS = 0.7;
export const STUDIO_POOP_LAND_END_PROGRESS = 0.82;
export const STUDIO_POOP_FALL_X_OFFSET_RATIO = -0.2;
export const STUDIO_POOP_BLOCK_SIX_LANDING_GAP = 0;
export const STUDIO_POOP_RISE_EASING_POWER = 3;
export const STUDIO_POOP_SLIDE_EASING_POWER = 12;
export const STUDIO_POOP_FALL_EASING_POWER = 3;
export const STUDIO_POOP_EXIT_EASING_POWER = 2;
export const STUDIO_WALKER_POST_POOP_PROGRESS_SPEED_RATIO = 0.058;
export const STUDIO_WALKER_POST_POOP_MOVE_START_PROGRESS = 0.95;
export const STUDIO_WALKER_POST_POOP_BLOCK_SIX_RUN_END_PROGRESS = 0.28;
export const STUDIO_WALKER_POST_POOP_BLOCK_SIX_DROP_END_PROGRESS = 0.45;
export const STUDIO_WALKER_POST_POOP_BLOCK_SIX_LAND_HOLD_END_PROGRESS = 0.55;
export const STUDIO_WALKER_POST_POOP_BLOCK_SEVEN_JUMP_END_PROGRESS = 1;
export const STUDIO_WALKER_POST_POOP_RUN_EASING_POWER = 2;
export const STUDIO_WALKER_POST_POOP_JUMP_HEIGHT_RATIO = 0.4;
export const STUDIO_WALKER_POST_POOP_BLOCK_FIVE_SECOND_STEP_LANDING_Y_OFFSET = 1;
export const STUDIO_DESK_LANDING_X_OFFSET = 4;
export const STUDIO_DESK_LANDING_Y_RATIO = 0.75;
export const STUDIO_DESK_LANDING_Y_OFFSET = -24;
export const MOBILE_STUDIO_DESK_LANDING_X_OFFSET_ADJUSTMENT_REM = -0.25;
export const MOBILE_STUDIO_DESK_LANDING_Y_OFFSET_ADJUSTMENT_REM = 0.5;
export const STUDIO_BLOCK_SURFACE_OFFSET_Y = -6;
export const STUDIO_BLOCK_SIX_JUMP_HEIGHT_RATIO = 0.5;
export const STUDIO_DESK_EXIT_JUMP_HEIGHT_RATIO = 1.15;
export const STUDIO_DESK_EXIT_JUMP_X_RATIO = 1 / 3;
export const STUDIO_EFFECT_Y_OFFSET = 8;
export const STUDIO_HIT_BOX_BOTTOM_GAP = 2;
export const STUDIO_POOP_HIDDEN_TRANSLATE_Y_RATIO = 0.8;
export const STUDIO_POOP_RISE_TRANSLATE_Y_RATIO = -0.1;
export const STUDIO_STEP_LEFT_EDGE_WIDTH_RATIO = 0.8;
export const STUDIO_BLOCK_SEVEN_LANDING_CELL_OFFSET = 5;
export const STUDIO_BLOCK_SEVEN_LANDING_MANYA_GAP_RATIO = 0.25;
export const STUDIO_CONTACT_REACTION_PROGRESS_SPEED_RATIO = 0.68;
export const STUDIO_MANYA_JUMP_END_PROGRESS = 0.24;
export const STUDIO_HEART_THROW_START_PROGRESS = STUDIO_MANYA_JUMP_END_PROGRESS;
export const STUDIO_HEART_THROW_END_PROGRESS = 0.58;
export const STUDIO_WALKER_REACTION_START_PROGRESS =
  STUDIO_HEART_THROW_END_PROGRESS;
export const STUDIO_WALKER_REACTION_FIRST_JUMP_END_PROGRESS = 0.55;
export const STUDIO_MANYA_JUMP_HEIGHT_RATIO = 0.18;
export const STUDIO_HEART_THROW_ARC_HEIGHT_RATIO = 0.3;
export const STUDIO_HEART_TARGET_Y_RATIO = 0.45;
export const STUDIO_WALKER_REACTION_FIRST_JUMP_HEIGHT_RATIO = 0.28;
export const STUDIO_WALKER_REACTION_SECOND_JUMP_HEIGHT_RATIO = 0.2;
export const MOBILE_SCENE_PROGRESS_MULTIPLIER = 1.5625;
export const MOBILE_STUDIO_BLOCK_FIVE_JUMP_HEIGHT_RATIO = 0.65;
