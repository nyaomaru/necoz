import type { WalkerOverridePose } from '~/lib/nyaomaru/types';

type WalkerSceneState = {
  /** Stable scene id used for coordination with effects. */
  sceneId: string;
  /** Normalized progress within the active walker scene. */
  progress: number;
  /** Active motion phase for the walker sprite. */
  phase: string;
};

type NyaomaruWindow = Window & {
  __necozContactSceneReady?: boolean;
  __necozNyaomaruState?: WalkerSceneState;
  __necozSceneScrollY?: number;
  __necozScrollY?: number;
  __necozStudioSceneReady?: boolean;
  __necozWalkerOverride?: WalkerOverridePose | null;
};

const getRuntimeWindow = () => window as NyaomaruWindow;

export const getVisualScrollY = () => getRuntimeWindow().__necozScrollY ?? window.scrollY;

export const getSceneScrollY = (visualScrollY = getVisualScrollY()) =>
  getRuntimeWindow().__necozSceneScrollY ?? visualScrollY;

export const setScrollState = ({
  sceneScrollY,
  visualScrollY,
}: {
  sceneScrollY: number;
  visualScrollY: number;
}) => {
  const runtimeWindow = getRuntimeWindow();

  runtimeWindow.__necozScrollY = visualScrollY;
  runtimeWindow.__necozSceneScrollY = sceneScrollY;
};

export const getWalkerOverride = () => getRuntimeWindow().__necozWalkerOverride ?? null;

export const setWalkerOverride = (override: WalkerOverridePose | null) => {
  getRuntimeWindow().__necozWalkerOverride = override;
};

export const getStudioSceneReady = () => getRuntimeWindow().__necozStudioSceneReady ?? false;

export const setStudioSceneReady = (ready: boolean) => {
  getRuntimeWindow().__necozStudioSceneReady = ready;
};

export const getContactSceneReady = () => getRuntimeWindow().__necozContactSceneReady ?? false;

export const setContactSceneReady = (ready: boolean) => {
  getRuntimeWindow().__necozContactSceneReady = ready;
};
