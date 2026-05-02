import type { WalkerEffectScene, WalkerOverridePose } from '~/lib/nyaomaru/types';
import {
  getStudioSceneReady,
  setContactSceneReady,
  setWalkerOverride,
} from '~/lib/nyaomaru/runtime-state';
import {
  CENTER_RATIO,
  FULL_PROGRESS,
  MOBILE_SCENE_PROGRESS_MULTIPLIER,
  MOBILE_STUDIO_BLOCK_FIVE_JUMP_HEIGHT_RATIO,
  MOBILE_STUDIO_DESK_LANDING_X_OFFSET_ADJUSTMENT_REM,
  MOBILE_STUDIO_DESK_LANDING_Y_OFFSET_ADJUSTMENT_REM,
  STUDIO_BLOCK_SEVEN_LANDING_CELL_OFFSET,
  STUDIO_BLOCK_SEVEN_LANDING_MANYA_GAP_RATIO,
  STUDIO_BLOCK_SIX_JUMP_HEIGHT_RATIO,
  STUDIO_BLOCK_SURFACE_OFFSET_Y,
  STUDIO_CONTACT_REACTION_PROGRESS_SPEED_RATIO,
  STUDIO_DESK_EXIT_JUMP_HEIGHT_RATIO,
  STUDIO_DESK_EXIT_JUMP_X_RATIO,
  STUDIO_DESK_LANDING_X_OFFSET,
  STUDIO_DESK_LANDING_Y_OFFSET,
  STUDIO_DESK_LANDING_Y_RATIO,
  STUDIO_EFFECT_Y_OFFSET,
  STUDIO_HEART_TARGET_Y_RATIO,
  STUDIO_HEART_THROW_ARC_HEIGHT_RATIO,
  STUDIO_HEART_THROW_END_PROGRESS,
  STUDIO_HEART_THROW_START_PROGRESS,
  STUDIO_HIT_BOX_BOTTOM_GAP,
  STUDIO_HIT_END_PROGRESS,
  STUDIO_HOLD_PROGRESS,
  STUDIO_MANYA_JUMP_END_PROGRESS,
  STUDIO_MANYA_JUMP_HEIGHT_RATIO,
  STUDIO_MOVE_END_PROGRESS,
  STUDIO_POOP_BLOCK_SIX_LANDING_GAP,
  STUDIO_POOP_EXIT_EASING_POWER,
  STUDIO_POOP_FALL_EASING_POWER,
  STUDIO_POOP_FALL_X_OFFSET_RATIO,
  STUDIO_POOP_HIDDEN_TRANSLATE_Y_RATIO,
  STUDIO_POOP_LAND_END_PROGRESS,
  STUDIO_POOP_PROGRESS_SPEED_RATIO,
  STUDIO_POOP_RISE_EASING_POWER,
  STUDIO_POOP_RISE_END_PROGRESS,
  STUDIO_POOP_RISE_TRANSLATE_Y_RATIO,
  STUDIO_POOP_SLIDE_EASING_POWER,
  STUDIO_POOP_SLIDE_END_PROGRESS,
  STUDIO_STEP_LEFT_EDGE_WIDTH_RATIO,
  STUDIO_WALKER_POST_POOP_BLOCK_FIVE_SECOND_STEP_LANDING_Y_OFFSET,
  STUDIO_WALKER_POST_POOP_BLOCK_SIX_LAND_HOLD_END_PROGRESS,
  STUDIO_WALKER_POST_POOP_BLOCK_SEVEN_JUMP_END_PROGRESS,
  STUDIO_WALKER_POST_POOP_BLOCK_SIX_DROP_END_PROGRESS,
  STUDIO_WALKER_POST_POOP_BLOCK_SIX_RUN_END_PROGRESS,
  STUDIO_WALKER_POST_POOP_JUMP_HEIGHT_RATIO,
  STUDIO_WALKER_POST_POOP_MOVE_START_PROGRESS,
  STUDIO_WALKER_POST_POOP_PROGRESS_SPEED_RATIO,
  STUDIO_WALKER_POST_POOP_RUN_EASING_POWER,
  STUDIO_WALKER_REACTION_FIRST_JUMP_END_PROGRESS,
  STUDIO_WALKER_REACTION_FIRST_JUMP_HEIGHT_RATIO,
  STUDIO_WALKER_REACTION_SECOND_JUMP_HEIGHT_RATIO,
  STUDIO_WALKER_REACTION_START_PROGRESS,
} from './model/studio';
import type {
  StudioAnchor,
  StudioFrameMetrics,
  StudioRouteSegment,
  StudioSceneElements,
  WalkerRoot,
} from './model/studio';
import { getFirstFilledCell, getLastFilledCell } from './helpers/block-shape';
import { getVisibleElement, getVisibleElements } from './helpers/dom';
import { measureEffectSceneFrame } from './helpers/effect-scene-frame';
import { setupEffectSceneLoop } from './helpers/effect-scene-loop';
import { getLocalSceneProgress } from './helpers/effect-scene-progress';
import { clamp, lerp } from './helpers/math';
import { getRoutePose } from './helpers/route-pose';
import {
  getWalkerCenterX,
  getWalkerPastRightX,
  getWalkerStepLeftX,
  getWalkerSurfaceY,
} from './helpers/walker-geometry';
import { isMobileViewport } from './helpers/viewport';
import {
  WALKER_LAYER_BEHIND_CONTENT,
  WALKER_LAYER_IN_STRUCTURE,
  getDefaultWalkerLayer,
} from './helpers/layers';

const resolveStudioSceneElements = (): StudioSceneElements | null => {
  const anchor = getVisibleElement<StudioAnchor>('[data-nyaomaru-studio-scene]');
  const blockFourSteps = getVisibleElements<HTMLElement>('[data-nyaomaru-studio-step]').sort(
    (left, right) =>
      Number(left.getAttribute('data-nyaomaru-studio-step')) -
      Number(right.getAttribute('data-nyaomaru-studio-step')),
  );
  const blockFiveTarget = getVisibleElement<HTMLElement>(
    '[data-nyaomaru-studio-block-five], [data-nyaomaru-studio-block-six]',
  );
  const blockFiveSteps = getVisibleElements<HTMLElement>(
    '[data-studio-walker-block-five-step], [data-studio-walker-block-six-step]',
  ).sort(
    (left, right) =>
      Number(
        left.getAttribute('data-studio-walker-block-five-step') ??
          left.getAttribute('data-studio-walker-block-six-step'),
      ) -
      Number(
        right.getAttribute('data-studio-walker-block-five-step') ??
          right.getAttribute('data-studio-walker-block-six-step'),
      ),
  );
  const blockSevenSteps = getVisibleElements<HTMLElement>('[data-studio-walker-step]').sort(
    (left, right) =>
      Number(left.getAttribute('data-studio-walker-step')) -
      Number(right.getAttribute('data-studio-walker-step')),
  );
  const heartIcon = getVisibleElement<HTMLImageElement>('[data-nyaomaru-contact-heart]');
  const manyaIcon = getVisibleElement<HTMLImageElement>('[data-nyaomaru-contact-manya]');
  const poopIcon = getVisibleElement<HTMLImageElement>('[data-nyaomaru-studio-poop]');
  const questionMark = getVisibleElement<HTMLImageElement>('[data-nyaomaru-studio-question-mark]');
  const studioDesk = getVisibleElement<HTMLImageElement>('[data-nyaomaru-studio-desk]');
  const walker = document.querySelector<WalkerRoot>('[data-nyaomaru-walker]');

  if (
    !anchor ||
    blockFourSteps.length === 0 ||
    !blockFiveTarget ||
    blockFiveSteps.length === 0 ||
    blockSevenSteps.length === 0 ||
    !heartIcon ||
    !manyaIcon ||
    !poopIcon ||
    !questionMark ||
    !studioDesk ||
    !walker
  ) {
    return null;
  }

  return {
    anchor,
    blockFiveTarget,
    blockFiveSteps,
    blockSevenSteps,
    blockFourSteps,
    heartIcon,
    manyaIcon,
    poopIcon,
    questionMark,
    studioDesk,
    walker,
  };
};

const measureStudioFrame = ({ anchor, walker }: Pick<StudioSceneElements, 'anchor' | 'walker'>) =>
  measureEffectSceneFrame({ anchor, walker }) satisfies StudioFrameMetrics;

const getStudioSurfaceY = (segment: HTMLElement, frame: StudioFrameMetrics) =>
  getWalkerSurfaceY(segment, frame, {
    applyMobileLift: true,
    effectOffsetY: STUDIO_EFFECT_Y_OFFSET,
    surfaceOffsetY: STUDIO_BLOCK_SURFACE_OFFSET_Y,
  });

const getStudioStepLeftX = (segment: HTMLElement, frame: StudioFrameMetrics) =>
  getWalkerStepLeftX(segment, frame, STUDIO_STEP_LEFT_EDGE_WIDTH_RATIO);

const getDeskLandingPose = (studioDesk: HTMLImageElement, frame: StudioFrameMetrics) => {
  const deskRect = studioDesk.getBoundingClientRect();
  const rootFontSize = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  );
  const remInPixels = Number.isFinite(rootFontSize) ? rootFontSize : 16;
  const mobileLandingXAdjustment = isMobileViewport()
    ? remInPixels * MOBILE_STUDIO_DESK_LANDING_X_OFFSET_ADJUSTMENT_REM
    : 0;
  const mobileLandingYAdjustment = isMobileViewport()
    ? remInPixels * MOBILE_STUDIO_DESK_LANDING_Y_OFFSET_ADJUSTMENT_REM
    : 0;

  return {
    phase: 'landed',
    x:
      deskRect.left +
      deskRect.width * CENTER_RATIO -
      frame.walkerWidth * CENTER_RATIO -
      frame.walkerBaseX +
      STUDIO_DESK_LANDING_X_OFFSET +
      mobileLandingXAdjustment,
    y:
      deskRect.top +
      deskRect.height * STUDIO_DESK_LANDING_Y_RATIO -
      frame.walkerHeight -
      frame.walkerBaseY +
      STUDIO_EFFECT_Y_OFFSET +
      STUDIO_DESK_LANDING_Y_OFFSET +
      mobileLandingYAdjustment,
    zIndex: WALKER_LAYER_IN_STRUCTURE,
  } satisfies WalkerOverridePose;
};

const getQuestionMarkUnderPose = (
  elements: Pick<StudioSceneElements, 'blockFiveTarget' | 'questionMark'>,
  frame: StudioFrameMetrics,
) => {
  const blockFiveLandingY = getStudioSurfaceY(elements.blockFiveTarget, frame);
  const questionMarkRect = elements.questionMark.getBoundingClientRect();

  return {
    x:
      questionMarkRect.left +
      questionMarkRect.width * CENTER_RATIO -
      frame.walkerWidth * CENTER_RATIO -
      frame.walkerBaseX,
    y: blockFiveLandingY,
  };
};

const getQuestionHitPose = (
  elements: Pick<StudioSceneElements, 'blockFiveTarget' | 'questionMark'>,
  frame: StudioFrameMetrics,
  progress: number,
) => {
  const underPose = getQuestionMarkUnderPose(elements, frame);
  const questionMarkRect = elements.questionMark.getBoundingClientRect();
  const hitPeakY = questionMarkRect.bottom - frame.walkerBaseY - STUDIO_HIT_BOX_BOTTOM_GAP;
  const jumpArc = 4 * progress * (1 - progress);
  const jumpHeight = Math.max(underPose.y - hitPeakY, 0);

  return {
    phase: 'second-fall',
    x: underPose.x,
    y: underPose.y - jumpArc * jumpHeight,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

const getStudioRoutePose = (segments: StudioRouteSegment[], progress: number) =>
  getRoutePose(segments, progress, {
    getCompletedZIndex: () => WALKER_LAYER_BEHIND_CONTENT,
    getDefaultZIndex: (segment) => getDefaultWalkerLayer(segment.phase),
  });

const getStudioRouteSegments = (
  elements: Pick<
    StudioSceneElements,
    'blockFourSteps' | 'blockFiveTarget' | 'questionMark' | 'studioDesk'
  >,
  frame: StudioFrameMetrics,
) => {
  const deskPose = getDeskLandingPose(elements.studioDesk, frame);
  const blockFiveRect = elements.blockFiveTarget.getBoundingClientRect();
  const questionMarkUnderPose = getQuestionMarkUnderPose(elements, frame);
  const blockFiveLandingX = blockFiveRect.right - frame.walkerWidth - frame.walkerBaseX;
  const blockFiveLandingY = getStudioSurfaceY(elements.blockFiveTarget, frame);
  const blockSixJumpHeight = isMobileViewport()
    ? Math.max(frame.walkerHeight * MOBILE_STUDIO_BLOCK_FIVE_JUMP_HEIGHT_RATIO, 18)
    : Math.max(frame.walkerHeight * STUDIO_BLOCK_SIX_JUMP_HEIGHT_RATIO, 36);
  const mobileStepLimit = isMobileViewport() ? 2 : elements.blockFourSteps.length;
  const segments: StudioRouteSegment[] = [];
  let currentX = deskPose.x;
  let currentY = deskPose.y;

  elements.blockFourSteps.slice(0, mobileStepLimit).forEach((step, index) => {
    const stepLeftX = getStudioStepLeftX(step, frame);
    const stepRunY = getStudioSurfaceY(step, frame);

    if (index === 0) {
      const deskExitJumpHeight = Math.max(
        frame.walkerHeight * STUDIO_DESK_EXIT_JUMP_HEIGHT_RATIO,
        28,
      );
      const deskExitJumpX = lerp(currentX, stepLeftX, STUDIO_DESK_EXIT_JUMP_X_RATIO);

      segments.push({
        arcHeight: deskExitJumpHeight,
        endX: deskExitJumpX,
        endY: stepRunY,
        phase: 'second-fall',
        startX: currentX,
        startY: currentY,
        zIndex: WALKER_LAYER_IN_STRUCTURE,
      });
      currentX = deskExitJumpX;
      currentY = stepRunY;

      if (Math.abs(stepLeftX - currentX) > 0.5) {
        segments.push({
          endX: stepLeftX,
          endY: currentY,
          phase: 'second-run',
          startX: currentX,
          startY: currentY,
          zIndex: WALKER_LAYER_BEHIND_CONTENT,
        });
        currentX = stepLeftX;
      }

      return;
    }

    if (Math.abs(stepRunY - currentY) > 0.5) {
      segments.push({
        endX: currentX,
        endY: stepRunY,
        phase: 'second-fall',
        startX: currentX,
        startY: currentY,
        zIndex: WALKER_LAYER_BEHIND_CONTENT,
      });
      currentY = stepRunY;
    }

    if (Math.abs(stepLeftX - currentX) > 0.5) {
      segments.push({
        endX: stepLeftX,
        endY: currentY,
        phase: 'second-run',
        startX: currentX,
        startY: currentY,
        zIndex: WALKER_LAYER_BEHIND_CONTENT,
      });
      currentX = stepLeftX;
    }
  });

  segments.push({
    arcHeight: blockSixJumpHeight,
    endX: blockFiveLandingX,
    endY: blockFiveLandingY,
    phase: 'second-fall',
    startX: currentX,
    startY: currentY,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  });
  segments.push({
    endX: questionMarkUnderPose.x,
    endY: questionMarkUnderPose.y,
    phase: 'second-run',
    startX: blockFiveLandingX,
    startY: blockFiveLandingY,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  });

  return segments;
};

const setPoopProgress = (
  poopIcon: HTMLImageElement,
  questionMark: HTMLImageElement,
  blockFiveTarget: HTMLElement,
  progress: number,
) => {
  const clampedProgress = clamp(progress, 0, FULL_PROGRESS);
  const questionMarkRect = questionMark.getBoundingClientRect();
  const poopRect = poopIcon.getBoundingClientRect();
  const poopOffsetParent = poopIcon.offsetParent;

  if (!(poopOffsetParent instanceof HTMLElement)) {
    return;
  }

  const stackRect = poopOffsetParent.getBoundingClientRect();
  const poopBottomBaseline = Number.parseFloat(window.getComputedStyle(poopIcon).bottom) || 0;
  const baseBottom = stackRect.bottom - poopBottomBaseline;
  const blockFiveRect = blockFiveTarget.getBoundingClientRect();
  const hiddenTranslateY = questionMarkRect.height * STUDIO_POOP_HIDDEN_TRANSLATE_Y_RATIO;
  const shownTranslateY = questionMarkRect.height * STUDIO_POOP_RISE_TRANSLATE_Y_RATIO;
  const edgeHiddenTranslateX = -(
    questionMarkRect.width * CENTER_RATIO +
    poopRect.width * CENTER_RATIO
  );
  const landedTranslateX = edgeHiddenTranslateX + poopRect.width * STUDIO_POOP_FALL_X_OFFSET_RATIO;
  const landedTranslateY = blockFiveRect.top - baseBottom - STUDIO_POOP_BLOCK_SIX_LANDING_GAP;
  const exitTranslateX = -(stackRect.left + stackRect.width * CENTER_RATIO + poopRect.width);
  const riseProgress = clamp(clampedProgress / STUDIO_POOP_RISE_END_PROGRESS, 0, FULL_PROGRESS);
  const slideProgress = clamp(
    (clampedProgress - STUDIO_POOP_RISE_END_PROGRESS) /
      (STUDIO_POOP_SLIDE_END_PROGRESS - STUDIO_POOP_RISE_END_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const landProgress = clamp(
    (clampedProgress - STUDIO_POOP_SLIDE_END_PROGRESS) /
      (STUDIO_POOP_LAND_END_PROGRESS - STUDIO_POOP_SLIDE_END_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const exitProgress = clamp(
    (clampedProgress - STUDIO_POOP_LAND_END_PROGRESS) /
      (FULL_PROGRESS - STUDIO_POOP_LAND_END_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const easedRiseProgress = Math.pow(riseProgress, STUDIO_POOP_RISE_EASING_POWER);
  const easedSlideProgress = Math.pow(slideProgress, STUDIO_POOP_SLIDE_EASING_POWER);
  const easedLandProgress = Math.pow(landProgress, STUDIO_POOP_FALL_EASING_POWER);
  const easedExitProgress = Math.pow(exitProgress, STUDIO_POOP_EXIT_EASING_POWER);

  let translateX = 0;
  let translateY = lerp(hiddenTranslateY, shownTranslateY, easedRiseProgress);

  if (clampedProgress > STUDIO_POOP_RISE_END_PROGRESS) {
    translateX = lerp(0, edgeHiddenTranslateX, easedSlideProgress);
    translateY = shownTranslateY;
  }

  if (clampedProgress > STUDIO_POOP_SLIDE_END_PROGRESS) {
    translateX = lerp(edgeHiddenTranslateX, landedTranslateX, easedLandProgress);
    translateY = lerp(shownTranslateY, landedTranslateY, easedLandProgress);
  }

  if (clampedProgress > STUDIO_POOP_LAND_END_PROGRESS) {
    translateX = lerp(landedTranslateX, exitTranslateX, easedExitProgress);
    translateY = landedTranslateY;
  }

  poopIcon.style.setProperty('--studio-poop-opacity', clampedProgress <= 0 ? '0' : '1');
  poopIcon.style.setProperty('--studio-poop-translate-x', `${translateX}px`);
  poopIcon.style.setProperty('--studio-poop-translate-y', `${translateY}px`);
};

const getCellSurfaceY = (cell: HTMLElement, frame: StudioFrameMetrics) =>
  getWalkerSurfaceY(cell, frame, {
    effectOffsetY: STUDIO_EFFECT_Y_OFFSET,
    surfaceOffsetY: STUDIO_BLOCK_SURFACE_OFFSET_Y,
  });

const getCellCenterX = (cell: HTMLElement, frame: StudioFrameMetrics) =>
  getWalkerCenterX(cell, frame, CENTER_RATIO);

const getCellFullyPastRightX = (cell: HTMLElement, frame: StudioFrameMetrics) =>
  getWalkerPastRightX(cell, frame);

const getWalkerBlockSevenLandingPose = (
  elements: Pick<
    StudioSceneElements,
    'blockFiveSteps' | 'blockSevenSteps' | 'manyaIcon' | 'questionMark'
  >,
  frame: StudioFrameMetrics,
) => {
  const underPose = getQuestionMarkUnderPose(
    { blockFiveTarget: elements.blockFiveSteps[0], questionMark: elements.questionMark },
    frame,
  );
  const blockSevenStepOne = elements.blockSevenSteps.at(0);

  if (!blockSevenStepOne) {
    return {
      phase: 'landed',
      x: underPose.x,
      y: underPose.y,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  const blockSevenLandingCell = getFirstFilledCell(blockSevenStepOne);

  if (!blockSevenLandingCell) {
    return {
      phase: 'landed',
      x: underPose.x,
      y: underPose.y,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  const blockSevenLandingCellRect = blockSevenLandingCell.getBoundingClientRect();
  const blockSevenLastCell = getLastFilledCell(blockSevenStepOne);

  if (!blockSevenLastCell) {
    return {
      phase: 'landed',
      x: underPose.x,
      y: underPose.y,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  const manyaRect = elements.manyaIcon.getBoundingClientRect();
  const leftmostLandingX = getCellCenterX(blockSevenLandingCell, frame);
  const rightmostLandingX = getCellCenterX(blockSevenLastCell, frame);
  const manyaAlignedLandingX =
    manyaRect.left -
    frame.walkerBaseX -
    frame.walkerWidth -
    blockSevenLandingCellRect.width * STUDIO_BLOCK_SEVEN_LANDING_MANYA_GAP_RATIO;

  return {
    phase: 'landed',
    x: isMobileViewport()
      ? clamp(manyaAlignedLandingX, leftmostLandingX, rightmostLandingX)
      : getCellCenterX(blockSevenLandingCell, frame) +
        blockSevenLandingCellRect.width * STUDIO_BLOCK_SEVEN_LANDING_CELL_OFFSET,
    y: getCellSurfaceY(blockSevenLandingCell, frame),
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

const resetContactReaction = (manyaIcon: HTMLImageElement, heartIcon: HTMLImageElement) => {
  manyaIcon.style.transform = '';
  heartIcon.style.setProperty('--contact-heart-opacity', '0');
  heartIcon.style.setProperty('--contact-heart-translate-x', '0px');
  heartIcon.style.setProperty('--contact-heart-translate-y', '0px');
};

const setContactReactionProgress = (
  manyaIcon: HTMLImageElement,
  heartIcon: HTMLImageElement,
  walkerLandingPose: WalkerOverridePose,
  frame: StudioFrameMetrics,
  progress: number,
) => {
  const clampedProgress = clamp(progress, 0, FULL_PROGRESS);
  const manyaRect = manyaIcon.getBoundingClientRect();
  const manyaJumpProgress = clamp(
    clampedProgress / STUDIO_MANYA_JUMP_END_PROGRESS,
    0,
    FULL_PROGRESS,
  );
  const manyaJumpArc = 4 * manyaJumpProgress * (1 - manyaJumpProgress);
  const manyaTranslateY = -manyaRect.height * STUDIO_MANYA_JUMP_HEIGHT_RATIO * manyaJumpArc;

  manyaIcon.style.transform = `translateY(${manyaTranslateY}px)`;

  const heartOffsetParent = heartIcon.offsetParent;

  if (!(heartOffsetParent instanceof HTMLElement)) {
    heartIcon.style.setProperty('--contact-heart-opacity', '0');
    return;
  }

  if (clampedProgress <= 0) {
    heartIcon.style.setProperty('--contact-heart-opacity', '0');
    heartIcon.style.setProperty('--contact-heart-translate-x', '0px');
    heartIcon.style.setProperty('--contact-heart-translate-y', '0px');
    return;
  }

  const heartRect = heartIcon.getBoundingClientRect();
  const anchorRect = heartOffsetParent.getBoundingClientRect();
  const heartWidth = Math.max(heartRect.width, 1);
  const heartHeight = Math.max(heartRect.height, 1);
  const heartThrowProgress = clamp(
    (clampedProgress - STUDIO_HEART_THROW_START_PROGRESS) /
      (STUDIO_HEART_THROW_END_PROGRESS - STUDIO_HEART_THROW_START_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const heartJumpArc = 4 * heartThrowProgress * (1 - heartThrowProgress);
  const heartStartX =
    manyaRect.left + manyaRect.width * CENTER_RATIO - anchorRect.left - heartWidth * CENTER_RATIO;
  const heartStartY =
    manyaRect.top + manyaRect.height * 0.35 - anchorRect.top - heartHeight * CENTER_RATIO;
  const heartTargetX =
    walkerLandingPose.x +
    frame.walkerBaseX +
    frame.walkerWidth * CENTER_RATIO -
    anchorRect.left -
    heartWidth * CENTER_RATIO;
  const heartTargetY =
    walkerLandingPose.y +
    frame.walkerBaseY +
    frame.walkerHeight * STUDIO_HEART_TARGET_Y_RATIO -
    anchorRect.top -
    heartHeight * CENTER_RATIO;
  const heartArcHeight = Math.max(
    Math.abs(heartTargetX - heartStartX) * STUDIO_HEART_THROW_ARC_HEIGHT_RATIO,
    heartHeight * 3,
  );
  const heartTranslateX = lerp(heartStartX, heartTargetX, heartThrowProgress);
  const heartTranslateY =
    lerp(heartStartY, heartTargetY, heartThrowProgress) - heartJumpArc * heartArcHeight;

  heartIcon.style.setProperty(
    '--contact-heart-opacity',
    clampedProgress >= STUDIO_HEART_THROW_START_PROGRESS &&
      clampedProgress <= STUDIO_HEART_THROW_END_PROGRESS
      ? '1'
      : '0',
  );
  heartIcon.style.setProperty('--contact-heart-translate-x', `${heartTranslateX}px`);
  heartIcon.style.setProperty('--contact-heart-translate-y', `${heartTranslateY}px`);
};

const getWalkerReactionPose = (
  walkerLandingPose: WalkerOverridePose,
  frame: StudioFrameMetrics,
  progress: number,
) => {
  const reactionProgress = clamp(
    (progress - STUDIO_WALKER_REACTION_START_PROGRESS) /
      (FULL_PROGRESS - STUDIO_WALKER_REACTION_START_PROGRESS),
    0,
    FULL_PROGRESS,
  );

  if (reactionProgress <= 0) {
    return walkerLandingPose;
  }

  const firstJumpProgress = clamp(
    reactionProgress / STUDIO_WALKER_REACTION_FIRST_JUMP_END_PROGRESS,
    0,
    FULL_PROGRESS,
  );

  if (reactionProgress <= STUDIO_WALKER_REACTION_FIRST_JUMP_END_PROGRESS) {
    const firstJumpArc = 4 * firstJumpProgress * (1 - firstJumpProgress);

    return {
      phase: firstJumpProgress >= FULL_PROGRESS ? 'landed' : 'second-fall',
      x: walkerLandingPose.x,
      y:
        walkerLandingPose.y -
        firstJumpArc * frame.walkerHeight * STUDIO_WALKER_REACTION_FIRST_JUMP_HEIGHT_RATIO,
      zIndex: walkerLandingPose.zIndex,
    } satisfies WalkerOverridePose;
  }

  const secondJumpProgress = clamp(
    (reactionProgress - STUDIO_WALKER_REACTION_FIRST_JUMP_END_PROGRESS) /
      (FULL_PROGRESS - STUDIO_WALKER_REACTION_FIRST_JUMP_END_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const secondJumpArc = 4 * secondJumpProgress * (1 - secondJumpProgress);

  return {
    phase: secondJumpProgress >= FULL_PROGRESS ? 'landed' : 'second-fall',
    x: walkerLandingPose.x,
    y:
      walkerLandingPose.y -
      secondJumpArc * frame.walkerHeight * STUDIO_WALKER_REACTION_SECOND_JUMP_HEIGHT_RATIO,
    zIndex: walkerLandingPose.zIndex,
  } satisfies WalkerOverridePose;
};

const getWalkerPostPoopPose = (
  elements: Pick<
    StudioSceneElements,
    'blockFiveSteps' | 'blockSevenSteps' | 'manyaIcon' | 'questionMark'
  >,
  frame: StudioFrameMetrics,
  progress: number,
) => {
  const underPose = getQuestionMarkUnderPose(
    { blockFiveTarget: elements.blockFiveSteps[0], questionMark: elements.questionMark },
    frame,
  );
  const blockFiveStepOne = elements.blockFiveSteps.at(0);
  const blockFiveLandingStep = isMobileViewport()
    ? elements.blockFiveSteps.at(1)
    : (elements.blockFiveSteps.at(2) ?? elements.blockFiveSteps.at(1));
  const walkerLandingPose = getWalkerBlockSevenLandingPose(elements, frame);

  if (!blockFiveStepOne || !blockFiveLandingStep) {
    return {
      phase: 'landed',
      x: underPose.x,
      y: underPose.y,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  const blockFiveStepOneLastCell = getLastFilledCell(blockFiveStepOne);
  const blockFiveLandingStepFirstCell = getFirstFilledCell(blockFiveLandingStep);

  if (!blockFiveStepOneLastCell || !blockFiveLandingStepFirstCell) {
    return {
      phase: 'landed',
      x: underPose.x,
      y: underPose.y,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  const blockFiveStepOnePastRightX =
    getCellFullyPastRightX(blockFiveStepOneLastCell, frame) + frame.walkerWidth;
  const blockFiveSecondStepLandingYOffset = isMobileViewport()
    ? frame.walkerHeight * STUDIO_WALKER_POST_POOP_BLOCK_FIVE_SECOND_STEP_LANDING_Y_OFFSET
    : 0;
  const blockFiveStepThreeLandingY =
    getCellSurfaceY(blockFiveLandingStepFirstCell, frame) - blockFiveSecondStepLandingYOffset;
  const blockSixRunProgress = clamp(
    progress / STUDIO_WALKER_POST_POOP_BLOCK_SIX_RUN_END_PROGRESS,
    0,
    FULL_PROGRESS,
  );
  const blockSixDropProgress = clamp(
    (progress - STUDIO_WALKER_POST_POOP_BLOCK_SIX_RUN_END_PROGRESS) /
      (STUDIO_WALKER_POST_POOP_BLOCK_SIX_DROP_END_PROGRESS -
        STUDIO_WALKER_POST_POOP_BLOCK_SIX_RUN_END_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const blockSixLandHoldEndProgress = isMobileViewport()
    ? STUDIO_WALKER_POST_POOP_BLOCK_SIX_DROP_END_PROGRESS
    : STUDIO_WALKER_POST_POOP_BLOCK_SIX_LAND_HOLD_END_PROGRESS;
  const blockSevenJumpProgress = clamp(
    (progress - blockSixLandHoldEndProgress) /
      (STUDIO_WALKER_POST_POOP_BLOCK_SEVEN_JUMP_END_PROGRESS - blockSixLandHoldEndProgress),
    0,
    FULL_PROGRESS,
  );
  const easedBlockSixRunProgress = Math.pow(
    blockSixRunProgress,
    STUDIO_WALKER_POST_POOP_RUN_EASING_POWER,
  );
  const blockSevenJumpArc = 4 * blockSevenJumpProgress * (1 - blockSevenJumpProgress);
  const blockSevenJumpHeight = Math.max(
    Math.abs(walkerLandingPose.x - blockFiveStepOnePastRightX) *
      STUDIO_WALKER_POST_POOP_JUMP_HEIGHT_RATIO,
    frame.walkerHeight,
  );

  if (progress <= STUDIO_WALKER_POST_POOP_BLOCK_SIX_RUN_END_PROGRESS) {
    return {
      phase: 'second-run',
      x: lerp(underPose.x, blockFiveStepOnePastRightX, easedBlockSixRunProgress),
      y: underPose.y,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  if (progress <= STUDIO_WALKER_POST_POOP_BLOCK_SIX_DROP_END_PROGRESS) {
    return {
      phase: 'second-fall',
      x: blockFiveStepOnePastRightX,
      y: lerp(underPose.y, blockFiveStepThreeLandingY, blockSixDropProgress),
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  if (progress <= blockSixLandHoldEndProgress) {
    return {
      phase: 'landed',
      x: blockFiveStepOnePastRightX,
      y: blockFiveStepThreeLandingY,
      zIndex: WALKER_LAYER_BEHIND_CONTENT,
    } satisfies WalkerOverridePose;
  }

  return {
    phase: blockSevenJumpProgress >= FULL_PROGRESS ? 'landed' : 'second-fall',
    x: lerp(blockFiveStepOnePastRightX, walkerLandingPose.x, blockSevenJumpProgress),
    y:
      lerp(blockFiveStepThreeLandingY, walkerLandingPose.y, blockSevenJumpProgress) -
      blockSevenJumpArc * blockSevenJumpHeight,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

export const studioScene: WalkerEffectScene = {
  id: 'studio',
  setup: () => {
    const elements = resolveStudioSceneElements();

    if (!elements) {
      return;
    }

    const { anchor } = elements;

    anchor.__studioSceneCleanup__?.();

    const update = () => {
      const frame = measureStudioFrame(elements);

      if (!getStudioSceneReady()) {
        anchor.__studioSceneStartProgress__ = undefined;
        setPoopProgress(elements.poopIcon, elements.questionMark, elements.blockFiveTarget, 0);
        resetContactReaction(elements.manyaIcon, elements.heartIcon);
        setContactSceneReady(false);
        return;
      }

      if (frame.progress <= 0 || frame.rawProgress <= 0) {
        setContactSceneReady(false);
        return;
      }

      anchor.__studioSceneStartProgress__ ??= frame.rawProgress;
      const { progress: localProgress, rawProgress: localRawProgress } = getLocalSceneProgress({
        progressMultiplier: isMobileViewport() ? MOBILE_SCENE_PROGRESS_MULTIPLIER : 1,
        rawProgress: frame.rawProgress,
        startProgress: anchor.__studioSceneStartProgress__,
      });

      if (localProgress <= STUDIO_HOLD_PROGRESS) {
        setPoopProgress(elements.poopIcon, elements.questionMark, elements.blockFiveTarget, 0);
        resetContactReaction(elements.manyaIcon, elements.heartIcon);
        setContactSceneReady(false);
        setWalkerOverride(getDeskLandingPose(elements.studioDesk, frame));
        return;
      }

      if (localProgress <= STUDIO_MOVE_END_PROGRESS) {
        setPoopProgress(elements.poopIcon, elements.questionMark, elements.blockFiveTarget, 0);
        resetContactReaction(elements.manyaIcon, elements.heartIcon);
        setContactSceneReady(false);
        const routeProgress = clamp(
          (localProgress - STUDIO_HOLD_PROGRESS) /
            (STUDIO_MOVE_END_PROGRESS - STUDIO_HOLD_PROGRESS),
          0,
          FULL_PROGRESS,
        );
        const routePose = getStudioRoutePose(
          getStudioRouteSegments(elements, frame),
          routeProgress,
        );

        if (routePose) {
          setWalkerOverride(routePose);
        }
        return;
      }

      if (localProgress <= STUDIO_HIT_END_PROGRESS) {
        setPoopProgress(elements.poopIcon, elements.questionMark, elements.blockFiveTarget, 0);
        resetContactReaction(elements.manyaIcon, elements.heartIcon);
        setContactSceneReady(false);
        const hitProgress = clamp(
          (localProgress - STUDIO_MOVE_END_PROGRESS) /
            (STUDIO_HIT_END_PROGRESS - STUDIO_MOVE_END_PROGRESS),
          0,
          FULL_PROGRESS,
        );
        setWalkerOverride(getQuestionHitPose(elements, frame, hitProgress));
        return;
      }

      const underPose = getQuestionMarkUnderPose(elements, frame);
      const poopRawProgress =
        ((localRawProgress - STUDIO_HIT_END_PROGRESS) / (FULL_PROGRESS - STUDIO_HIT_END_PROGRESS)) *
        STUDIO_POOP_PROGRESS_SPEED_RATIO;
      const poopProgress = clamp(poopRawProgress, 0, FULL_PROGRESS);

      const walkerPoopRawProgress =
        ((poopRawProgress - STUDIO_WALKER_POST_POOP_MOVE_START_PROGRESS) *
          STUDIO_WALKER_POST_POOP_PROGRESS_SPEED_RATIO) /
        (FULL_PROGRESS - STUDIO_WALKER_POST_POOP_MOVE_START_PROGRESS);
      const walkerPoopProgress = clamp(walkerPoopRawProgress, 0, FULL_PROGRESS);
      const walkerLandingPose = getWalkerBlockSevenLandingPose(elements, frame);
      const contactReactionProgress = clamp(
        (walkerPoopRawProgress - FULL_PROGRESS) * STUDIO_CONTACT_REACTION_PROGRESS_SPEED_RATIO,
        0,
        FULL_PROGRESS,
      );
      const baseWalkerPose =
        poopProgress <= STUDIO_WALKER_POST_POOP_MOVE_START_PROGRESS
          ? ({
              phase: 'landed',
              x: underPose.x,
              y: underPose.y,
              zIndex: WALKER_LAYER_BEHIND_CONTENT,
            } satisfies WalkerOverridePose)
          : getWalkerPostPoopPose(elements, frame, walkerPoopProgress);
      const walkerPose =
        contactReactionProgress <= STUDIO_WALKER_REACTION_START_PROGRESS
          ? baseWalkerPose
          : getWalkerReactionPose(walkerLandingPose, frame, contactReactionProgress);

      setContactSceneReady(contactReactionProgress >= FULL_PROGRESS);
      setWalkerOverride(walkerPose);
      setPoopProgress(
        elements.poopIcon,
        elements.questionMark,
        elements.blockFiveTarget,
        poopProgress,
      );
      setContactReactionProgress(
        elements.manyaIcon,
        elements.heartIcon,
        walkerLandingPose,
        frame,
        contactReactionProgress,
      );
    };

    anchor.__studioSceneCleanup__ = setupEffectSceneLoop({
      onCleanup: () => {
        delete anchor.__studioSceneCleanup__;
        delete anchor.__studioSceneStartProgress__;
      },
      update,
    });
  },
};
