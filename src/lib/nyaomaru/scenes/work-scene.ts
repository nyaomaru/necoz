import type { WalkerEffectScene } from '~/lib/nyaomaru/types';
import { SCENE_DOM_SELECTORS, WORK_SCENE_PHASES } from './dom-contracts';
import {
  CENTER_RATIO,
  DESCEND_PHASE_END,
  EMERGE_PHASE_END,
  FULL_PROGRESS,
  LEFT_SHIFT_PHASE_END,
  MOBILE_SCENE_PROGRESS_MULTIPLIER,
  MOBILE_SHOT_REVEAL_START_PROGRESS,
  MOBILE_SHOT_OFFSET_X,
  PLUMBING_OFFSET_Y,
  SHOT_BURST_TRAVEL_RATIO,
  SHOT_OFFSET_X,
  SHOT_REVEAL_START_PROGRESS,
  STACK_WORK_ICON_X_RATIO,
} from './model/work';
import type { WalkerRoot, WorkAnchor, WorkFrameMetrics, WorkSceneElements } from './model/work';
import { getVisibleElement } from './helpers/dom';
import { measureEffectSceneFrame } from './helpers/effect-scene-frame';
import { clamp } from './helpers/math';
import { setupEffectSceneLoop } from './helpers/effect-scene-loop';
import { isMobileViewport } from './helpers/viewport';
import {
  applyDescendPhase,
  applyFinalPhase,
  applyHiddenPhase,
  applyLeftShiftPhase,
  applyRevealPhase,
  createCollisionState,
  createSceneActions,
  setWorkScenePhase,
} from './work-scene-motion';

const getTranslateFromTransform = (transform: string) => {
  if (transform === 'none') {
    return { x: 0, y: 0 };
  }

  const matrix = new DOMMatrixReadOnly(transform);

  return {
    x: matrix.m41,
    y: matrix.m42,
  };
};

const getShotRevealStartProgress = () =>
  isMobileViewport() ? MOBILE_SHOT_REVEAL_START_PROGRESS : SHOT_REVEAL_START_PROGRESS;

const resolveWorkSceneElements = (): WorkSceneElements | null => {
  const anchor = getVisibleElement<WorkAnchor>(SCENE_DOM_SELECTORS.work.anchor);
  const activeBlockThree = anchor?.closest<HTMLElement>(SCENE_DOM_SELECTORS.work.activeBlockThree);
  const phaseTargets = Array.from(
    document.querySelectorAll<WorkAnchor>(SCENE_DOM_SELECTORS.work.phaseTarget),
  ).filter((element) => element.getClientRects().length > 0);
  const blockThreeFirstRow = activeBlockThree?.querySelector<HTMLElement>(
    SCENE_DOM_SELECTORS.work.firstRow,
  );
  const blockThreeThirdRow = activeBlockThree?.querySelector<HTMLElement>(
    SCENE_DOM_SELECTORS.work.thirdRow,
  );
  const mobileBlockTarget = getVisibleElement<HTMLElement>(SCENE_DOM_SELECTORS.work.mobileTarget);
  const mobileWorkClampTarget = getVisibleElement<HTMLElement>(
    SCENE_DOM_SELECTORS.work.mobileClampTarget,
  );
  const workStack = isMobileViewport()
    ? getVisibleElement<HTMLElement>(SCENE_DOM_SELECTORS.work.mobileOrigin)
    : getVisibleElement<HTMLElement>(SCENE_DOM_SELECTORS.work.display);
  const blockFourExit = document.querySelector<HTMLElement>(SCENE_DOM_SELECTORS.work.exit);
  const blockFourSteps = Array.from(
    document.querySelectorAll<HTMLElement>(SCENE_DOM_SELECTORS.work.step),
  );
  const studioDesk = getVisibleElement<HTMLImageElement>(SCENE_DOM_SELECTORS.studio.desk);
  const workIcon = workStack?.querySelector<HTMLImageElement>(SCENE_DOM_SELECTORS.work.workIcon);
  const plumberIcon = workStack?.querySelector<HTMLImageElement>(
    SCENE_DOM_SELECTORS.work.plumberIcon,
  );
  const visibleBlockThree = Array.from(
    activeBlockThree?.querySelectorAll<HTMLElement>(SCENE_DOM_SELECTORS.work.firstRow) ?? [],
  ).find((element) => element.getClientRects().length > 0);
  const blockThreeTarget = visibleBlockThree?.querySelector<HTMLElement>(
    SCENE_DOM_SELECTORS.blockShape.filledCell,
  );
  const shotIcon = document.querySelector<HTMLElement>(SCENE_DOM_SELECTORS.work.shotIcon);
  const walker = document.querySelector<WalkerRoot>(SCENE_DOM_SELECTORS.walker);

  if (
    !anchor ||
    !activeBlockThree ||
    !blockThreeFirstRow ||
    !blockThreeThirdRow ||
    phaseTargets.length === 0 ||
    !blockFourExit ||
    blockFourSteps.length === 0 ||
    !studioDesk ||
    !workIcon ||
    !plumberIcon ||
    !blockThreeTarget ||
    !workStack ||
    !shotIcon ||
    !walker
  ) {
    return null;
  }

  return {
    anchor,
    blockThreeFirstRow,
    blockThreeThirdRow,
    phaseTargets,
    mobileBlockTarget,
    mobileWorkClampTarget,
    blockFourExit,
    blockFourSteps,
    blockThreeTarget,
    plumberIcon,
    studioDesk,
    shotIcon,
    walker,
    workIcon,
    workStack,
  };
};

const measureFrame = ({
  anchor,
  blockThreeTarget,
  mobileBlockTarget,
  mobileWorkClampTarget,
  plumberIcon,
  shotIcon,
  walker,
  workIcon,
  workStack,
}: WorkSceneElements): WorkFrameMetrics => {
  const sceneFrame = measureEffectSceneFrame({
    anchor,
    progressMultiplier: isMobileViewport() ? MOBILE_SCENE_PROGRESS_MULTIPLIER : 1,
    walker,
  });
  const stackRect = workStack.getBoundingClientRect();
  const plumberRect = plumberIcon.getBoundingClientRect();
  const workRect = workIcon.getBoundingClientRect();
  const stackX =
    plumberRect.left +
    plumberRect.width * CENTER_RATIO -
    (stackRect.left + stackRect.width * STACK_WORK_ICON_X_RATIO + workRect.width * CENTER_RATIO);
  const hiddenY = workRect.height;
  const emergeY = -plumberRect.height;
  const { progress, rawProgress } = sceneFrame;
  const emergeProgress = Math.min(progress / EMERGE_PHASE_END, FULL_PROGRESS);
  const leftShiftProgress = Math.min(
    Math.max((progress - EMERGE_PHASE_END) / (LEFT_SHIFT_PHASE_END - EMERGE_PHASE_END), 0),
    FULL_PROGRESS,
  );
  const descendProgress = Math.min(
    Math.max((progress - LEFT_SHIFT_PHASE_END) / (DESCEND_PHASE_END - LEFT_SHIFT_PHASE_END), 0),
    FULL_PROGRESS,
  );
  const finalLeftShiftProgress = Math.max(
    (rawProgress - DESCEND_PHASE_END) / (FULL_PROGRESS - DESCEND_PHASE_END),
    0,
  );
  const leftShiftX = plumberRect.width * CENTER_RATIO + workRect.width * CENTER_RATIO;
  const descendedY = isMobileViewport()
    ? emergeY + plumberRect.height
    : emergeY + plumberRect.height - PLUMBING_OFFSET_Y;
  const walkerRect = walker.getBoundingClientRect();
  const walkerComputedStyle = window.getComputedStyle(walker);
  const walkerBaseX = sceneFrame.walkerBaseX;
  const walkerBaseY = sceneFrame.walkerBaseY;
  const walkerTranslate = getTranslateFromTransform(walkerComputedStyle.transform);
  const shotRect = shotIcon.getBoundingClientRect();
  const shotX = walkerRect.right + (isMobileViewport() ? MOBILE_SHOT_OFFSET_X : SHOT_OFFSET_X);
  const shotY = walkerRect.top + walkerRect.height * CENTER_RATIO - shotRect.height * CENTER_RATIO;
  const shotRevealStartProgress = getShotRevealStartProgress();
  const shotTravelProgress = clamp(
    (finalLeftShiftProgress - shotRevealStartProgress) /
      Math.max(FULL_PROGRESS - shotRevealStartProgress, Number.EPSILON),
    0,
    FULL_PROGRESS,
  );
  const shotBurstOffsetX = shotRect.width * SHOT_BURST_TRAVEL_RATIO * shotTravelProgress;
  const baseWorkLeft = stackRect.left + stackRect.width * STACK_WORK_ICON_X_RATIO;
  const baseWorkTop = stackRect.bottom - workRect.height;
  const activeWorkClampTarget = isMobileViewport()
    ? (mobileWorkClampTarget ?? mobileBlockTarget ?? blockThreeTarget)
    : blockThreeTarget;
  const targetLeftClampX = activeWorkClampTarget.getBoundingClientRect().left - baseWorkLeft;

  return {
    baseWorkLeft,
    baseWorkTop,
    descendedY,
    descendProgress,
    emergeProgress,
    emergeY,
    finalLeftShiftProgress,
    hiddenY,
    leftShiftProgress,
    leftShiftX,
    plumberRect,
    progress,
    rawProgress,
    shotBurstOffsetX,
    shotRect,
    shotX,
    shotY,
    stackX,
    targetLeftClampX,
    walkerBaseX,
    walkerBaseY,
    walkerHeight: sceneFrame.walkerHeight,
    walkerRect,
    walkerTranslateX: walkerTranslate.x,
    walkerTranslateY: walkerTranslate.y,
    workRect,
  };
};

export const workScene: WalkerEffectScene = {
  id: 'work',
  setup: () => {
    const elements = resolveWorkSceneElements();

    if (!elements) {
      return;
    }

    const { anchor } = elements;

    anchor.__workSceneCleanup__?.();

    const collisionState = createCollisionState();
    const actions = createSceneActions(collisionState, elements);

    const update = () => {
      const frame = measureFrame(elements);

      if (frame.progress <= 0) {
        applyHiddenPhase(actions, collisionState, elements, frame);
        return;
      }

      setWorkScenePhase(elements.phaseTargets, WORK_SCENE_PHASES.reveal);

      if (frame.progress <= EMERGE_PHASE_END) {
        applyRevealPhase(actions, collisionState, elements, frame);
        return;
      }

      if (frame.progress <= LEFT_SHIFT_PHASE_END) {
        applyLeftShiftPhase(actions, collisionState, frame);
        return;
      }

      if (frame.progress <= DESCEND_PHASE_END) {
        applyDescendPhase(actions, collisionState, frame);
        return;
      }

      applyFinalPhase(actions, elements, collisionState, frame);
    };

    anchor.__workSceneCleanup__ = setupEffectSceneLoop({
      onCleanup: () => {
        delete anchor.__workSceneCleanup__;
      },
      update,
    });
  },
};
