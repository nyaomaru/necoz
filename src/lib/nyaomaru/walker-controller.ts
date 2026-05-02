import { contactScene } from './scenes/contact-scene';
import { heroScene } from './scenes/hero-scene';
import { studioScene } from './scenes/studio-scene';
import { workScene } from './scenes/work-scene';
import { clamp } from '~/lib/math';
import { getSceneScrollY, getWalkerOverride } from '~/lib/nyaomaru/runtime-state';
import type {
  AnyWalkerScene,
  WalkerEffectScene,
  WalkerRoot,
  WalkerScene,
  WalkerSceneSnapshot,
} from './types';

const WALKER_SELECTOR = '[data-nyaomaru-walker]';
const WALKER_STATE_EVENT = 'necoz:walker-state';
const MIN_SCROLL_DISTANCE = 1;

const scenes: AnyWalkerScene[] = [heroScene];
const effectScenes: WalkerEffectScene[] = [workScene, studioScene, contactScene];

const getActiveScrollY = () => getSceneScrollY();

const resolveWalkerRoot = () => document.querySelector<WalkerRoot>(WALKER_SELECTOR);

const getSceneProgress = (scrollY: number, snapshot: WalkerSceneSnapshot) =>
  clamp(
    (scrollY - snapshot.scrollStart) /
      Math.max(snapshot.scrollEnd - snapshot.scrollStart, MIN_SCROLL_DISTANCE),
    0,
    1,
  );

const getActiveSceneState = (scrollY: number) => {
  const measuredScenes = scenes
    .map((scene) => {
      const snapshot = scene.measure();

      if (!snapshot) {
        return null;
      }

      return { scene, snapshot };
    })
    .filter((entry) => entry !== null)
    .sort((left, right) => left.snapshot.scrollStart - right.snapshot.scrollStart);

  if (measuredScenes.length === 0) {
    return null;
  }

  return (
    measuredScenes.find(({ snapshot }, index) => {
      const nextStart = measuredScenes[index + 1]?.snapshot.scrollStart ?? Infinity;

      return scrollY >= snapshot.scrollStart && scrollY < nextStart;
    }) ?? measuredScenes[measuredScenes.length - 1]
  );
};

const renderWalker = (walker: WalkerRoot, pose: ReturnType<WalkerScene['getPose']>) => {
  const override = getWalkerOverride();
  const resolvedPose = override ?? pose;

  walker.style.transform = `translate(${resolvedPose.x}px, ${resolvedPose.y}px)`;
  walker.style.opacity = '1';
  walker.dataset.phase = resolvedPose.phase;

  if (override?.zIndex !== undefined) {
    walker.style.zIndex = override.zIndex;
  } else {
    walker.style.zIndex = '';
  }
};

const emitWalkerState = (sceneId: string, progress: number, phase: string) => {
  const detail = {
    sceneId,
    progress,
    phase,
  };

  (
    window as Window & {
      __necozNyaomaruState?: typeof detail;
    }
  ).__necozNyaomaruState = detail;
  window.dispatchEvent(new CustomEvent(WALKER_STATE_EVENT, { detail }));
};

export const setupNyaomaruWalker = () => {
  effectScenes.forEach((scene) => {
    scene.setup();
  });

  const walker = resolveWalkerRoot();

  if (!walker) {
    return;
  }

  walker.__nyaomaruWalkerCleanup__?.();

  let rafId = 0;
  const controller = new AbortController();
  const update = () => {
    const scrollY = getActiveScrollY();
    const activeSceneState = getActiveSceneState(scrollY);

    if (!activeSceneState) {
      return;
    }

    const progress = getSceneProgress(scrollY, activeSceneState.snapshot);
    const pose = activeSceneState.scene.getPose(progress, activeSceneState.snapshot);

    renderWalker(walker, pose);
    emitWalkerState(activeSceneState.scene.id, progress, pose.phase);
  };
  const requestUpdate = () => {
    cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(update);
  };
  const cleanup = () => {
    cancelAnimationFrame(rafId);
    controller.abort();
    delete walker.__nyaomaruWalkerCleanup__;
  };

  walker.__nyaomaruWalkerCleanup__ = cleanup;

  requestUpdate();
  window.addEventListener('scroll', requestUpdate, {
    passive: true,
    signal: controller.signal,
  });
  window.addEventListener('necoz:virtual-scroll', requestUpdate, {
    signal: controller.signal,
  });
  window.addEventListener('resize', requestUpdate, {
    signal: controller.signal,
  });
  window.addEventListener('load', requestUpdate, {
    signal: controller.signal,
  });
};
