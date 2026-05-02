/** Motion phases supported by the walker scenes. */
export type WalkerPhase = 'first-run' | 'first-fall' | 'second-run' | 'second-fall' | 'landed';

export type WalkerPose = {
  /** Walker X coordinate in viewport pixels. */
  x: number;
  /** Walker Y coordinate in viewport pixels. */
  y: number;
  /** Named motion phase used for styling and effects. */
  phase: WalkerPhase;
};

export type WalkerOverridePose = WalkerPose & {
  /** Optional z-index override used by effect scenes. */
  zIndex?: string;
};

export type WalkerRoot = HTMLElement & {
  /** Cleanup handler for listeners attached by the walker controller. */
  __nyaomaruWalkerCleanup__?: () => void;
};

export type WalkerSceneSnapshot<TLayout = unknown> = {
  /** Cached layout data measured for the current scene. */
  layout: TLayout;
  /** Scroll position where the scene becomes active. */
  scrollStart: number;
  /** Scroll position where the scene reaches full progress. */
  scrollEnd: number;
};

export type WalkerScene<TLayout = unknown> = {
  /** Stable scene id used for coordination with effects. */
  id: string;
  /** Measures DOM-dependent layout and scroll bounds for the scene. */
  measure: () => WalkerSceneSnapshot<TLayout> | null;
  /** Maps normalized scene progress to a walker pose. */
  getPose: (progress: number, snapshot: WalkerSceneSnapshot<TLayout>) => WalkerPose;
};

export type WalkerEffectScene = {
  /** Stable effect scene id. */
  id: string;
  /** Attaches DOM listeners needed for secondary effects. */
  setup: () => void;
};

/** Shared alias used for heterogeneous scene arrays. */
export type AnyWalkerScene = WalkerScene<any>;
