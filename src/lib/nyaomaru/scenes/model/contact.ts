export type ContactAnchor = HTMLElement & {
  /** Cleanup handler for the scroll-linked contact scene listeners. */
  __contactSceneCleanup__?: () => void;
  /** Raw scene progress captured when the contact scene becomes active. */
  __contactSceneStartProgress__?: number;
};

export type WalkerRoot = HTMLElement;

export type ContactSceneElements = {
  /** Section root that owns the contact scene lifecycle. */
  anchor: ContactAnchor;
  /** Ordered stair-step surfaces inside `block-seven`. */
  blockSevenSteps: HTMLElement[];
  /** Manya icon used to align the inherited block-seven landing point. */
  manyaIcon: HTMLImageElement;
  /** Footer element used as the final landing surface. */
  footer: HTMLElement;
  /** Goal flag sprite placed above the footer. */
  goalFlag: HTMLImageElement;
  /** Fish sprite that nyaomaru jumps to collect. */
  goalFish: HTMLImageElement;
  /** Fish-bone sprite thrown after nyaomaru exits. */
  goalFishBone: HTMLImageElement;
  /** Fixed-position nyaomaru walker root. */
  walker: WalkerRoot;
};

export type ContactFrameMetrics = {
  /** Clamped scene progress in the 0..1 range. */
  progress: number;
  /** Unclamped scene progress derived from the contact section scroll. */
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

export type ContactRouteSegment = {
  /** Optional jump arc height applied while traversing the segment. */
  arcHeight?: number;
  /** End X coordinate of the route segment. */
  endX: number;
  /** End Y coordinate of the route segment. */
  endY: number;
  /** Optional multiplier used to slow down or emphasize a segment. */
  lengthMultiplier?: number;
  /** Walker phase used while traversing this segment. */
  phase: 'landed' | 'second-run' | 'second-fall';
  /** Start X coordinate of the route segment. */
  startX: number;
  /** Start Y coordinate of the route segment. */
  startY: number;
  /** Optional z-index override used for layered route segments. */
  zIndex?: string;
};

export const FULL_PROGRESS = 1;
export const CENTER_RATIO = 0.5;
export const CONTACT_EFFECT_Y_OFFSET = 8;
export const CONTACT_BLOCK_SURFACE_OFFSET_Y = -6;
export const CONTACT_STEP_LEFT_EDGE_WIDTH_RATIO = 0.8;
export const CONTACT_BLOCK_SEVEN_LANDING_CELL_OFFSET = 5;
export const CONTACT_BLOCK_SEVEN_LANDING_MANYA_GAP_RATIO = 0.25;
export const CONTACT_FOOTER_LANDING_PADDING_CELLS = 3;
export const CONTACT_FOOTER_MIN_LEFT_GAP_CELLS = 2;
export const CONTACT_FOOTER_LANDING_SURFACE_OFFSET_Y = 2;
export const CONTACT_FOOTER_JUMP_HEIGHT_RATIO = 0.35;
export const CONTACT_GOAL_FLAG_STOP_GAP_CELLS = 1.5;
export const CONTACT_GOAL_FLAG_APPROACH_LENGTH_MULTIPLIER = 2.5;
export const CONTACT_ROUTE_END_PROGRESS = 0.62;
export const CONTACT_WAIT_END_PROGRESS = 0.72;
export const CONTACT_FISH_JUMP_END_PROGRESS = 0.86;
export const CONTACT_FISH_SPRITE_SWAP_PROGRESS = 0.9;
export const CONTACT_FISH_TOUCH_HEIGHT_RATIO = 0.7;
export const CONTACT_FISH_JUMP_ARC_HEIGHT_RATIO = 0.32;
export const CONTACT_FOOTER_RIGHT_LANDING_GAP_CELLS = 3;
export const CONTACT_LOVE_HOLD_END_PROGRESS = 1.14;
export const CONTACT_RIGHT_EXIT_END_PROGRESS = 1.62;
export const CONTACT_BONE_THROW_END_PROGRESS = 2.08;
export const CONTACT_BONE_LANDING_GAP_CELLS = 1.75;
export const MOBILE_CONTACT_BONE_LANDING_GAP_CELLS = 0.875;
export const CONTACT_BONE_THROW_ARC_HEIGHT_RATIO = 0.28;
export const CONTACT_BONE_THROW_LAND_END_PROGRESS = 0.58;
export const CONTACT_BONE_FIRST_BOUNCE_DRIFT_CELLS = 1.2;
export const CONTACT_BONE_FIRST_BOUNCE_HEIGHT_RATIO = 0.12;
export const CONTACT_BONE_SECOND_BOUNCE_DRIFT_RATIO = 0.75;
export const CONTACT_BONE_SECOND_BOUNCE_HEIGHT_RATIO = CONTACT_BONE_FIRST_BOUNCE_HEIGHT_RATIO * 0.5;
export const MOBILE_SCENE_PROGRESS_MULTIPLIER = 1.5625;
export const MOBILE_CONTACT_FOOTER_RIGHT_LANDING_WALKER_OFFSET_RATIO = 1;
