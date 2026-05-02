import type {
  CollisionState,
  RectBounds,
  WorkAnchor,
  WorkFrameMetrics,
  WorkSceneActions,
  WorkSceneElements,
} from './model/work';
import {
  CENTER_RATIO,
  COLLISION_SHAKE_CYCLES,
  COLLISION_SHAKE_DISTANCE_RATIO,
  COLLISION_SHAKE_PROGRESS,
  COLLISION_STOP_PROGRESS,
  EMERGE_DISTANCE_RATIO,
  FINAL_WORK_LEFT_SHIFT_RATIO,
  FULL_PROGRESS,
  MOBILE_COLLISION_SHAKE_DISTANCE_RATIO,
  MOBILE_SHOT_COLLISION_START_PROGRESS,
  MOBILE_SHOT_REVEAL_START_PROGRESS,
  MOBILE_WALKER_APPROACH_RATIO,
  MOBILE_WALKER_BLOCK_FOUR_PATH_PROGRESS_RATIO,
  MOBILE_WALKER_JUMP_HEIGHT_RATIO,
  MOBILE_WALKER_PLUMBER_DWELL_PROGRESS,
  MOBILE_WALKER_PROGRESS_SPEED_RATIO,
  PLUMBER_LANDING_OFFSET_X,
  PLUMBER_LANDING_OFFSET_Y,
  RESPONSIVE_WALKER_BLOCK_FOUR_PATH_MAX_PROGRESS_RATIO,
  RESPONSIVE_WALKER_COMPACT_HEIGHT_DAMPING_RATIO,
  RESPONSIVE_WALKER_PLUMBER_DWELL_MIN_PROGRESS,
  RESPONSIVE_WALKER_PROGRESS_MIN_HEIGHT,
  RESPONSIVE_WALKER_PROGRESS_MIN_WIDTH,
  RESPONSIVE_WALKER_PROGRESS_REFERENCE_HEIGHT,
  RESPONSIVE_WALKER_PROGRESS_REFERENCE_WIDTH,
  RESPONSIVE_WALKER_PROGRESS_SPEED_MAX_RATIO,
  SHOT_COLLISION_START_PROGRESS,
  SHOT_REVEAL_START_PROGRESS,
  WALKER_APPROACH_PHASE_END,
  WALKER_APPROACH_RATIO,
  WALKER_BLOCK_FOUR_PATH_PROGRESS_RATIO,
  WALKER_EFFECT_Y_OFFSET,
  WALKER_JUMP_HEIGHT_RATIO,
  WALKER_JUMP_PHASE_END,
  WALKER_MIN_POST_COLLISION_PROGRESS_RANGE,
  WALKER_PLUMBER_DWELL_DURATION_RATIO,
  WALKER_PLUMBER_DWELL_PROGRESS,
  WALKER_PLUMBER_ENTER_RATIO,
  WALKER_PROGRESS_SPEED_RATIO,
  WORK_COLLISION_TARGET_WIDTH_RATIO,
} from './model/work';
import { setStudioSceneReady, setWalkerOverride } from '~/lib/nyaomaru/runtime-state';
import { clamp, lerp } from './helpers/math';
import { isMobileViewport } from './helpers/viewport';
import { WALKER_LAYER_BEHIND_CONTENT, WALKER_LAYER_IN_STRUCTURE } from './helpers/layers';
import {
  createCollisionMotionSnapshot,
  getBlockFourRouteSegments,
  getWalkerRoutePose,
  getWalkerRunY,
} from './work-scene-route';

const isOverlapping = (a: RectBounds, b: RectBounds) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const getShotRevealStartProgress = () =>
  isMobileViewport() ? MOBILE_SHOT_REVEAL_START_PROGRESS : SHOT_REVEAL_START_PROGRESS;

const getShotCollisionStartProgress = () =>
  isMobileViewport() ? MOBILE_SHOT_COLLISION_START_PROGRESS : SHOT_COLLISION_START_PROGRESS;

const getResponsiveProgressPressure = () =>
  clamp(
    (RESPONSIVE_WALKER_PROGRESS_REFERENCE_WIDTH - window.innerWidth) /
      (RESPONSIVE_WALKER_PROGRESS_REFERENCE_WIDTH - RESPONSIVE_WALKER_PROGRESS_MIN_WIDTH),
    0,
    FULL_PROGRESS,
  ) *
  (1 -
    clamp(
      (RESPONSIVE_WALKER_PROGRESS_REFERENCE_HEIGHT - window.innerHeight) /
        (RESPONSIVE_WALKER_PROGRESS_REFERENCE_HEIGHT - RESPONSIVE_WALKER_PROGRESS_MIN_HEIGHT),
      0,
      FULL_PROGRESS,
    ) *
      RESPONSIVE_WALKER_COMPACT_HEIGHT_DAMPING_RATIO);

const getWalkerProgressSpeedRatio = () =>
  isMobileViewport()
    ? MOBILE_WALKER_PROGRESS_SPEED_RATIO
    : lerp(
        WALKER_PROGRESS_SPEED_RATIO,
        RESPONSIVE_WALKER_PROGRESS_SPEED_MAX_RATIO,
        getResponsiveProgressPressure(),
      );

const getWalkerBlockFourPathProgressRatio = () =>
  isMobileViewport()
    ? MOBILE_WALKER_BLOCK_FOUR_PATH_PROGRESS_RATIO
    : lerp(
        WALKER_BLOCK_FOUR_PATH_PROGRESS_RATIO,
        RESPONSIVE_WALKER_BLOCK_FOUR_PATH_MAX_PROGRESS_RATIO,
        getResponsiveProgressPressure(),
      );

const getWalkerPlumberDwellProgress = () =>
  isMobileViewport()
    ? MOBILE_WALKER_PLUMBER_DWELL_PROGRESS
    : lerp(
        WALKER_PLUMBER_DWELL_PROGRESS,
        RESPONSIVE_WALKER_PLUMBER_DWELL_MIN_PROGRESS,
        getResponsiveProgressPressure(),
      ) * WALKER_PLUMBER_DWELL_DURATION_RATIO;

export const createCollisionState = (): CollisionState => ({
  collidedFinalLeftShiftProgress: null,
  collisionMotionSnapshot: null,
  collidedWalkerX: null,
  collidedWalkerY: null,
  collidedWorkX: null,
  hasShotCollided: false,
});

const resetCollisionState = (collisionState: CollisionState) => {
  collisionState.collidedFinalLeftShiftProgress = null;
  collisionState.collisionMotionSnapshot = null;
  collisionState.collidedWalkerX = null;
  collisionState.collidedWalkerY = null;
  collisionState.collidedWorkX = null;
  collisionState.hasShotCollided = false;
};

export const setWorkScenePhase = (phaseTargets: WorkAnchor[], phase: 'hidden' | 'reveal') => {
  phaseTargets.forEach((target) => {
    target.dataset.workScenePhase = phase;
  });
};

export const createSceneActions = (
  collisionState: CollisionState,
  { shotIcon, workIcon }: Pick<WorkSceneElements, 'shotIcon' | 'workIcon'>,
): WorkSceneActions => {
  return {
    hideShot: () => {
      shotIcon.style.opacity = '0';
    },
    resetShot: () => {
      shotIcon.style.setProperty('--shot-burst-translate-x', '0px');
      shotIcon.style.opacity = '0';
    },
    resetWalkerOverride: () => {
      collisionState.collidedWalkerX = null;
      collisionState.collidedWalkerY = null;
      setStudioSceneReady(false);
      setWalkerOverride(null);
    },
    setShotPosition: (x: number, y: number, burstOffsetX: number) => {
      shotIcon.style.setProperty('--shot-translate-x', `${x}px`);
      shotIcon.style.setProperty('--shot-translate-y', `${y}px`);
      shotIcon.style.setProperty('--shot-burst-translate-x', `${burstOffsetX}px`);
      shotIcon.style.opacity = '1';
    },
    setStudioSceneReady,
    setWalkerOverride,
    setWorkPosition: (x: number, y: number) => {
      workIcon.style.setProperty('--work-translate-x', `${x}px`);
      workIcon.style.setProperty('--work-translate-y', `${y}px`);
    },
  };
};

const getFinalWorkX = (frame: WorkFrameMetrics) =>
  Math.max(
    frame.stackX -
      frame.leftShiftX -
      frame.leftShiftX * FINAL_WORK_LEFT_SHIFT_RATIO * frame.finalLeftShiftProgress,
    frame.targetLeftClampX,
  );

const getWorkTrackY = (frame: WorkFrameMetrics) => frame.descendedY;

const getFinalWorkRect = (frame: WorkFrameMetrics): RectBounds => {
  const finalWorkX = getFinalWorkX(frame);
  const finalWorkY = getWorkTrackY(frame);

  return {
    bottom: frame.baseWorkTop + finalWorkY + frame.workRect.height,
    left: frame.baseWorkLeft + finalWorkX,
    right: frame.baseWorkLeft + finalWorkX + frame.workRect.width,
    top: frame.baseWorkTop + finalWorkY,
  };
};

const getWorkCollisionRect = (frame: WorkFrameMetrics): RectBounds => {
  const finalWorkRect = getFinalWorkRect(frame);
  const collisionWidth = Math.max(
    frame.workRect.width * WORK_COLLISION_TARGET_WIDTH_RATIO,
    frame.shotRect.width * 0.9,
  );
  const centerX = (finalWorkRect.left + finalWorkRect.right) * CENTER_RATIO;

  return {
    bottom: finalWorkRect.bottom,
    left: centerX - collisionWidth * CENTER_RATIO,
    right: centerX + collisionWidth * CENTER_RATIO,
    top: finalWorkRect.top,
  };
};

const getShotBaseRect = (frame: WorkFrameMetrics): RectBounds => ({
  bottom: frame.shotY + frame.shotRect.height,
  left: frame.shotX,
  right: frame.shotX + frame.shotRect.width,
  top: frame.shotY,
});

const getShotBurstRect = (frame: WorkFrameMetrics): RectBounds => ({
  bottom: frame.shotY + frame.shotRect.height,
  left: frame.shotX + frame.shotBurstOffsetX,
  right: frame.shotX + frame.shotBurstOffsetX + frame.shotRect.width,
  top: frame.shotY,
});

const shouldCollide = (frame: WorkFrameMetrics, collisionState: CollisionState) =>
  collisionState.hasShotCollided ||
  (frame.finalLeftShiftProgress >= getShotCollisionStartProgress() &&
    (isOverlapping(getWorkCollisionRect(frame), getShotBaseRect(frame)) ||
      isOverlapping(getWorkCollisionRect(frame), getShotBurstRect(frame))));

const syncCollisionState = (
  collisionState: CollisionState,
  elements: Pick<
    WorkSceneElements,
    | 'blockThreeFirstRow'
    | 'blockThreeThirdRow'
    | 'blockFourExit'
    | 'blockFourSteps'
    | 'blockThreeTarget'
    | 'mobileBlockTarget'
    | 'studioDesk'
  >,
  frame: WorkFrameMetrics,
) => {
  collisionState.hasShotCollided = true;
  collisionState.collidedWorkX ??= getFinalWorkX(frame);
  collisionState.collidedFinalLeftShiftProgress ??= frame.finalLeftShiftProgress;
  collisionState.collidedWalkerX ??= frame.walkerTranslateX;
  collisionState.collidedWalkerY ??= frame.walkerTranslateY;
  collisionState.collisionMotionSnapshot ??= createCollisionMotionSnapshot(elements, frame);
};

const hasRewoundBeforeCollision = (frame: WorkFrameMetrics, collisionState: CollisionState) =>
  collisionState.hasShotCollided &&
  collisionState.collidedFinalLeftShiftProgress !== null &&
  frame.finalLeftShiftProgress < collisionState.collidedFinalLeftShiftProgress;

export const applyHiddenPhase = (
  actions: WorkSceneActions,
  collisionState: CollisionState,
  { phaseTargets }: Pick<WorkSceneElements, 'phaseTargets'>,
  frame: WorkFrameMetrics,
) => {
  setWorkScenePhase(phaseTargets, 'hidden');
  resetCollisionState(collisionState);
  actions.resetWalkerOverride();
  actions.setWorkPosition(frame.stackX, frame.hiddenY);
  actions.resetShot();
};

export const applyRevealPhase = (
  actions: WorkSceneActions,
  collisionState: CollisionState,
  { phaseTargets }: Pick<WorkSceneElements, 'phaseTargets'>,
  frame: WorkFrameMetrics,
) => {
  setWorkScenePhase(phaseTargets, 'reveal');
  resetCollisionState(collisionState);
  actions.resetWalkerOverride();
  actions.resetShot();
  actions.setWorkPosition(
    frame.stackX,
    Math.max(
      frame.hiddenY +
        (frame.emergeY - frame.hiddenY) * frame.emergeProgress * EMERGE_DISTANCE_RATIO,
      frame.emergeY,
    ),
  );
};

export const applyLeftShiftPhase = (
  actions: WorkSceneActions,
  collisionState: CollisionState,
  frame: WorkFrameMetrics,
) => {
  resetCollisionState(collisionState);
  actions.resetWalkerOverride();
  actions.resetShot();
  actions.setWorkPosition(
    frame.stackX - frame.leftShiftX * frame.leftShiftProgress,
    frame.emergeY - PLUMBER_LANDING_OFFSET_Y,
  );
};

export const applyDescendPhase = (
  actions: WorkSceneActions,
  collisionState: CollisionState,
  frame: WorkFrameMetrics,
) => {
  resetCollisionState(collisionState);
  actions.resetWalkerOverride();
  actions.resetShot();
  actions.setWorkPosition(
    frame.stackX - frame.leftShiftX - PLUMBER_LANDING_OFFSET_X,
    Math.min(frame.emergeY + frame.plumberRect.height * frame.descendProgress, frame.descendedY),
  );
};

const applyCollisionPause = (
  actions: WorkSceneActions,
  elements: Pick<WorkSceneElements, 'blockThreeTarget' | 'mobileBlockTarget'>,
  collisionState: CollisionState,
  frame: WorkFrameMetrics,
) => {
  actions.setStudioSceneReady(false);

  const collisionElapsedProgress = Math.max(
    frame.finalLeftShiftProgress - (collisionState.collidedFinalLeftShiftProgress ?? 0),
    0,
  );
  const collisionHoldProgress = COLLISION_SHAKE_PROGRESS + COLLISION_STOP_PROGRESS;
  const shakeDistance = clamp(
    frame.workRect.width *
      (isMobileViewport() ? MOBILE_COLLISION_SHAKE_DISTANCE_RATIO : COLLISION_SHAKE_DISTANCE_RATIO),
    8,
    18,
  );
  const walkerX = collisionState.collidedWalkerX ?? frame.walkerTranslateX;
  const collisionWalkerRunY =
    collisionState.collisionMotionSnapshot?.walkerRunY ?? getWalkerRunY(elements, frame);
  const walkerFloorOffsetY =
    (collisionState.collidedWalkerY ?? frame.walkerTranslateY) - collisionWalkerRunY;
  const walkerY = getWalkerRunY(elements, frame) + walkerFloorOffsetY;

  if (collisionElapsedProgress <= COLLISION_SHAKE_PROGRESS) {
    const shakeProgress = clamp(
      collisionElapsedProgress / COLLISION_SHAKE_PROGRESS,
      0,
      FULL_PROGRESS,
    );
    const shakeOffsetX =
      Math.sin(shakeProgress * Math.PI * 2 * COLLISION_SHAKE_CYCLES) *
      shakeDistance *
      (1 - shakeProgress * 0.35);

    actions.setWorkPosition(
      Math.max(
        (collisionState.collidedWorkX ?? frame.targetLeftClampX) + shakeOffsetX,
        frame.targetLeftClampX,
      ),
      getWorkTrackY(frame),
    );
    actions.setWalkerOverride({
      phase: 'second-run',
      x: walkerX,
      y: walkerY,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    });
    return true;
  }

  if (collisionElapsedProgress <= collisionHoldProgress) {
    actions.setWorkPosition(
      collisionState.collidedWorkX ?? frame.targetLeftClampX,
      getWorkTrackY(frame),
    );
    actions.setWalkerOverride({
      phase: 'second-run',
      x: walkerX,
      y: walkerY,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    });
    return true;
  }

  return false;
};

const applyWalkerFinalMotion = (
  actions: WorkSceneActions,
  elements: Pick<
    WorkSceneElements,
    | 'blockThreeFirstRow'
    | 'blockThreeThirdRow'
    | 'blockFourExit'
    | 'blockFourSteps'
    | 'blockThreeTarget'
    | 'mobileBlockTarget'
    | 'studioDesk'
  >,
  collisionState: CollisionState,
  frame: WorkFrameMetrics,
) => {
  const walkerProgressSpeedRatio = getWalkerProgressSpeedRatio();
  const walkerBlockFourPathProgressRatio = getWalkerBlockFourPathProgressRatio();
  const walkerPlumberDwellProgress = getWalkerPlumberDwellProgress();
  const walkerApproachRatio = isMobileViewport()
    ? MOBILE_WALKER_APPROACH_RATIO
    : WALKER_APPROACH_RATIO;
  const walkerJumpHeightRatio = isMobileViewport()
    ? MOBILE_WALKER_JUMP_HEIGHT_RATIO
    : WALKER_JUMP_HEIGHT_RATIO;
  const walkerJumpPhaseEnd = isMobileViewport() ? WALKER_JUMP_PHASE_END : FULL_PROGRESS;
  const collisionHoldProgress = COLLISION_SHAKE_PROGRESS + COLLISION_STOP_PROGRESS;
  const resumedLeftShiftProgress = Math.max(
    frame.finalLeftShiftProgress -
      (collisionState.collidedFinalLeftShiftProgress ?? 0) -
      collisionHoldProgress,
    0,
  );
  const remainingLeftShiftProgress = Math.max(
    FULL_PROGRESS - (collisionState.collidedFinalLeftShiftProgress ?? 0) - collisionHoldProgress,
    WALKER_MIN_POST_COLLISION_PROGRESS_RANGE,
  );
  const rawWalkerProgress =
    (resumedLeftShiftProgress / remainingLeftShiftProgress) * walkerProgressSpeedRatio;
  const normalizedWalkerProgress = clamp(rawWalkerProgress, 0, FULL_PROGRESS);
  const resumedWorkX = Math.max(
    (collisionState.collidedWorkX ?? frame.targetLeftClampX) -
      frame.leftShiftX * FINAL_WORK_LEFT_SHIFT_RATIO * resumedLeftShiftProgress,
    frame.targetLeftClampX,
  );
  const motionSnapshot =
    collisionState.collisionMotionSnapshot ?? createCollisionMotionSnapshot(elements, frame);
  const walkerStartX = collisionState.collidedWalkerX ?? frame.walkerTranslateX;
  const walkerFloorOffsetY =
    (collisionState.collidedWalkerY ?? frame.walkerTranslateY) - motionSnapshot.walkerRunY;
  const walkerRunY = getWalkerRunY(elements, frame);
  const walkerStartY = walkerRunY + walkerFloorOffsetY;
  const plumberLandingX =
    frame.plumberRect.left +
    frame.plumberRect.width * CENTER_RATIO -
    frame.walkerRect.width * CENTER_RATIO -
    frame.walkerBaseX;
  const plumberLandingY =
    frame.plumberRect.top +
    PLUMBER_LANDING_OFFSET_Y -
    frame.walkerHeight -
    frame.walkerBaseY +
    WALKER_EFFECT_Y_OFFSET;
  const walkerApproachX = lerp(walkerStartX, plumberLandingX, walkerApproachRatio);
  const walkerApproachY = lerp(walkerStartY, walkerRunY, walkerApproachRatio);
  const walkerEnterY =
    frame.plumberRect.top +
    frame.plumberRect.height * WALKER_PLUMBER_ENTER_RATIO -
    frame.walkerHeight -
    frame.walkerBaseY +
    WALKER_EFFECT_Y_OFFSET;
  const blockFourRouteStartProgress = FULL_PROGRESS + walkerPlumberDwellProgress;

  actions.setWorkPosition(resumedWorkX, getWorkTrackY(frame));

  if (rawWalkerProgress > blockFourRouteStartProgress) {
    const blockFourProgress = clamp(
      (rawWalkerProgress - blockFourRouteStartProgress) * walkerBlockFourPathProgressRatio,
      0,
      FULL_PROGRESS,
    );
    const blockFourPose = getWalkerRoutePose(
      getBlockFourRouteSegments(elements, frame),
      blockFourProgress,
    );

    if (blockFourPose) {
      actions.setStudioSceneReady(blockFourProgress >= FULL_PROGRESS);
      actions.setWalkerOverride(blockFourPose);
      return;
    }
  }

  actions.setStudioSceneReady(false);

  if (isMobileViewport() && normalizedWalkerProgress <= WALKER_JUMP_PHASE_END) {
    const jumpProgress = clamp(normalizedWalkerProgress / WALKER_JUMP_PHASE_END, 0, FULL_PROGRESS);
    const jumpArc = 4 * jumpProgress * (1 - jumpProgress);
    const jumpHeight = frame.plumberRect.height * walkerJumpHeightRatio;

    actions.setWalkerOverride({
      phase: 'second-fall',
      x: lerp(walkerStartX, plumberLandingX, jumpProgress),
      y: lerp(walkerStartY, plumberLandingY, jumpProgress) - jumpArc * jumpHeight,
      zIndex: WALKER_LAYER_IN_STRUCTURE,
    });
    return;
  }

  if (normalizedWalkerProgress <= WALKER_APPROACH_PHASE_END) {
    const approachProgress = clamp(
      normalizedWalkerProgress / WALKER_APPROACH_PHASE_END,
      0,
      FULL_PROGRESS,
    );

    actions.setWalkerOverride({
      phase: 'second-run',
      x: lerp(walkerStartX, walkerApproachX, approachProgress),
      y: lerp(walkerStartY, walkerApproachY, approachProgress),
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    });
    return;
  }

  if (rawWalkerProgress <= walkerJumpPhaseEnd) {
    const jumpProgress = clamp(
      (rawWalkerProgress - WALKER_APPROACH_PHASE_END) /
        (walkerJumpPhaseEnd - WALKER_APPROACH_PHASE_END),
      0,
      FULL_PROGRESS,
    );
    const jumpArc = 4 * jumpProgress * (1 - jumpProgress);
    const jumpHeight = frame.plumberRect.height * walkerJumpHeightRatio;

    actions.setWalkerOverride({
      phase: 'second-fall',
      x: lerp(walkerApproachX, plumberLandingX, jumpProgress),
      y: lerp(walkerApproachY, plumberLandingY, jumpProgress) - jumpArc * jumpHeight,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    });
    return;
  }

  const enterProgress = clamp(
    (rawWalkerProgress - walkerJumpPhaseEnd) / (blockFourRouteStartProgress - walkerJumpPhaseEnd),
    0,
    FULL_PROGRESS,
  );

  actions.setWalkerOverride({
    phase: 'landed',
    x: plumberLandingX,
    y: lerp(plumberLandingY, walkerEnterY, enterProgress),
    zIndex: WALKER_LAYER_IN_STRUCTURE,
  });
};

export const applyFinalPhase = (
  actions: WorkSceneActions,
  elements: Pick<
    WorkSceneElements,
    | 'blockThreeFirstRow'
    | 'blockThreeThirdRow'
    | 'blockFourExit'
    | 'blockFourSteps'
    | 'blockThreeTarget'
    | 'mobileBlockTarget'
    | 'studioDesk'
  >,
  collisionState: CollisionState,
  frame: WorkFrameMetrics,
) => {
  if (hasRewoundBeforeCollision(frame, collisionState)) {
    resetCollisionState(collisionState);
  }

  if (frame.finalLeftShiftProgress < getShotRevealStartProgress()) {
    actions.hideShot();
  } else if (shouldCollide(frame, collisionState)) {
    syncCollisionState(collisionState, elements, frame);
    actions.hideShot();
  } else {
    actions.setShotPosition(frame.shotX, frame.shotY, frame.shotBurstOffsetX);
  }

  if (
    collisionState.hasShotCollided &&
    collisionState.collidedWorkX !== null &&
    collisionState.collidedFinalLeftShiftProgress !== null &&
    collisionState.collidedWalkerX !== null &&
    collisionState.collidedWalkerY !== null
  ) {
    if (applyCollisionPause(actions, elements, collisionState, frame)) {
      return;
    }

    applyWalkerFinalMotion(actions, elements, collisionState, frame);
    return;
  }

  actions.resetWalkerOverride();
  actions.setWorkPosition(getFinalWorkX(frame), getWorkTrackY(frame));
};
