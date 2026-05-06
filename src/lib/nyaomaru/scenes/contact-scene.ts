import type { WalkerEffectScene, WalkerOverridePose } from '~/lib/nyaomaru/types';
import { getContactSceneReady, setWalkerOverride } from '~/lib/nyaomaru/runtime-state';
import {
  CENTER_RATIO,
  CONTACT_BLOCK_SEVEN_LANDING_CELL_OFFSET,
  CONTACT_BLOCK_SEVEN_LANDING_MANYA_GAP_RATIO,
  CONTACT_BLOCK_SURFACE_OFFSET_Y,
  CONTACT_BONE_FIRST_BOUNCE_DRIFT_CELLS,
  CONTACT_BONE_FIRST_BOUNCE_HEIGHT_RATIO,
  CONTACT_BONE_LANDING_GAP_CELLS,
  CONTACT_BONE_SECOND_BOUNCE_DRIFT_RATIO,
  CONTACT_BONE_SECOND_BOUNCE_HEIGHT_RATIO,
  CONTACT_BONE_THROW_ARC_HEIGHT_RATIO,
  CONTACT_BONE_THROW_END_PROGRESS,
  CONTACT_BONE_THROW_LAND_END_PROGRESS,
  CONTACT_EFFECT_Y_OFFSET,
  CONTACT_FISH_JUMP_ARC_HEIGHT_RATIO,
  CONTACT_FISH_JUMP_END_PROGRESS,
  CONTACT_FISH_SPRITE_SWAP_PROGRESS,
  CONTACT_FISH_TOUCH_HEIGHT_RATIO,
  CONTACT_FOOTER_JUMP_HEIGHT_RATIO,
  CONTACT_FOOTER_LANDING_PADDING_CELLS,
  CONTACT_FOOTER_LANDING_SURFACE_OFFSET_Y,
  CONTACT_FOOTER_MIN_LEFT_GAP_CELLS,
  CONTACT_FOOTER_RIGHT_LANDING_GAP_CELLS,
  CONTACT_GOAL_FLAG_APPROACH_LENGTH_MULTIPLIER,
  CONTACT_GOAL_FLAG_STOP_GAP_CELLS,
  CONTACT_LOVE_HOLD_END_PROGRESS,
  CONTACT_RIGHT_EXIT_END_PROGRESS,
  CONTACT_ROUTE_END_PROGRESS,
  CONTACT_STEP_LEFT_EDGE_WIDTH_RATIO,
  CONTACT_WAIT_END_PROGRESS,
  FULL_PROGRESS,
  MOBILE_CONTACT_BONE_LANDING_GAP_CELLS,
  MOBILE_CONTACT_FOOTER_RIGHT_LANDING_WALKER_OFFSET_RATIO,
  MOBILE_SCENE_PROGRESS_MULTIPLIER,
} from './model/contact';
import type {
  ContactAnchor,
  ContactFrameMetrics,
  ContactRouteSegment,
  ContactSceneElements,
  WalkerRoot,
} from './model/contact';
import { SCENE_DOM_ATTRIBUTES, SCENE_DOM_SELECTORS } from './dom-contracts';
import { getFilledCells, getFirstFilledCell } from './helpers/block-shape';
import { getVisibleElement, getVisibleElements } from './helpers/dom';
import { measureEffectSceneFrame } from './helpers/effect-scene-frame';
import { setupEffectSceneLoop } from './helpers/effect-scene-loop';
import { getLocalSceneProgress } from './helpers/effect-scene-progress';
import { clamp, lerp } from './helpers/math';
import { getRoutePose } from './helpers/route-pose';
import { getWalkerCenterX, getWalkerStepLeftX, getWalkerSurfaceY } from './helpers/walker-geometry';
import { isMobileViewport } from './helpers/viewport';
import { WALKER_LAYER_BEHIND_CONTENT, WALKER_LAYER_IN_FRONT_OF_CONTENT } from './helpers/layers';

const resolveContactSceneElements = (): ContactSceneElements | null => {
  const anchor = getVisibleElement<ContactAnchor>(SCENE_DOM_SELECTORS.contact.scene);
  const blockSevenSteps = getVisibleElements<HTMLElement>(SCENE_DOM_SELECTORS.contact.step).sort(
    (left, right) =>
      Number(left.getAttribute(SCENE_DOM_ATTRIBUTES.contact.step)) -
      Number(right.getAttribute(SCENE_DOM_ATTRIBUTES.contact.step)),
  );
  const manyaIcon = getVisibleElement<HTMLImageElement>(SCENE_DOM_SELECTORS.contact.manya);
  const footer = document.querySelector<HTMLElement>(SCENE_DOM_SELECTORS.contact.footer);
  const goalFlag = document.querySelector<HTMLImageElement>(SCENE_DOM_SELECTORS.contact.goalFlag);
  const goalFish = document.querySelector<HTMLImageElement>(SCENE_DOM_SELECTORS.contact.goalFish);
  const goalFishBone = document.querySelector<HTMLImageElement>(
    SCENE_DOM_SELECTORS.contact.goalFishBone,
  );
  const walker = document.querySelector<WalkerRoot>(SCENE_DOM_SELECTORS.walker);

  if (
    !anchor ||
    blockSevenSteps.length === 0 ||
    !manyaIcon ||
    !footer ||
    !goalFlag ||
    !goalFish ||
    !goalFishBone ||
    !walker
  ) {
    return null;
  }

  return {
    anchor,
    blockSevenSteps,
    manyaIcon,
    footer,
    goalFlag,
    goalFish,
    goalFishBone,
    walker,
  };
};

const measureContactFrame = ({ anchor, walker }: Pick<ContactSceneElements, 'anchor' | 'walker'>) =>
  measureEffectSceneFrame({ anchor, walker }) satisfies ContactFrameMetrics;

const getCellSurfaceY = (cell: HTMLElement, frame: ContactFrameMetrics) =>
  getWalkerSurfaceY(cell, frame, {
    applyMobileLift: true,
    effectOffsetY: CONTACT_EFFECT_Y_OFFSET,
    surfaceOffsetY: CONTACT_BLOCK_SURFACE_OFFSET_Y,
  });

const getCellCenterX = (cell: HTMLElement, frame: ContactFrameMetrics) =>
  getWalkerCenterX(cell, frame, CENTER_RATIO);

const getStepLeftX = (cell: HTMLElement, frame: ContactFrameMetrics) =>
  getWalkerStepLeftX(cell, frame, CONTACT_STEP_LEFT_EDGE_WIDTH_RATIO);

const getBlockSevenLandingPose = (
  { blockSevenSteps, manyaIcon }: Pick<ContactSceneElements, 'blockSevenSteps' | 'manyaIcon'>,
  frame: ContactFrameMetrics,
) => {
  const blockSevenStepOne = blockSevenSteps.at(0);

  if (!blockSevenStepOne) {
    return null;
  }

  const landingCell = getFirstFilledCell(blockSevenStepOne);

  if (!landingCell) {
    return null;
  }

  const landingCellRect = landingCell.getBoundingClientRect();
  const blockSevenLastCell = getFilledCells(blockSevenStepOne).at(-1);

  if (!blockSevenLastCell) {
    return null;
  }

  const manyaRect = manyaIcon.getBoundingClientRect();
  const leftmostLandingX = getCellCenterX(landingCell, frame);
  const rightmostLandingX = getCellCenterX(blockSevenLastCell, frame);
  const manyaAlignedLandingX =
    manyaRect.left -
    frame.walkerBaseX -
    frame.walkerWidth -
    landingCellRect.width * CONTACT_BLOCK_SEVEN_LANDING_MANYA_GAP_RATIO;

  return {
    phase: 'landed',
    x: isMobileViewport()
      ? clamp(manyaAlignedLandingX, leftmostLandingX, rightmostLandingX)
      : getCellCenterX(landingCell, frame) +
        landingCellRect.width * CONTACT_BLOCK_SEVEN_LANDING_CELL_OFFSET,
    y: getCellSurfaceY(landingCell, frame),
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

const getFooterLandingPose = (
  footer: HTMLElement,
  frame: ContactFrameMetrics,
  currentX: number,
  cellWidth: number,
) => {
  const footerRect = footer.getBoundingClientRect();
  const preferredLandingX =
    footerRect.left +
    cellWidth * CONTACT_FOOTER_LANDING_PADDING_CELLS -
    frame.walkerWidth * CENTER_RATIO -
    frame.walkerBaseX;
  const maxLandingX = currentX - cellWidth * CONTACT_FOOTER_MIN_LEFT_GAP_CELLS;

  return {
    phase: 'landed',
    x: Math.min(preferredLandingX, maxLandingX),
    y:
      footerRect.top -
      frame.walkerHeight -
      frame.walkerBaseY +
      CONTACT_FOOTER_LANDING_SURFACE_OFFSET_Y,
    zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
  } satisfies WalkerOverridePose;
};

const getGoalFlagStopPose = (
  goalFlag: HTMLImageElement,
  footerLandingPose: WalkerOverridePose,
  frame: ContactFrameMetrics,
  cellWidth: number,
) => {
  const goalFlagRect = goalFlag.getBoundingClientRect();
  const stopX = Math.min(
    goalFlagRect.left -
      frame.walkerWidth -
      cellWidth * CONTACT_GOAL_FLAG_STOP_GAP_CELLS -
      frame.walkerBaseX,
    goalFlagRect.left - frame.walkerWidth - frame.walkerBaseX,
  );

  return {
    phase: 'landed',
    x: Math.max(stopX, footerLandingPose.x),
    y: footerLandingPose.y,
    zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
  } satisfies WalkerOverridePose;
};

const getGoalFishTouchPose = (goalFish: HTMLImageElement, frame: ContactFrameMetrics) => {
  const fishRect = goalFish.getBoundingClientRect();

  return {
    phase: 'second-fall',
    x:
      fishRect.left +
      fishRect.width * CENTER_RATIO -
      frame.walkerWidth * CENTER_RATIO -
      frame.walkerBaseX,
    y:
      fishRect.top +
      fishRect.height * CENTER_RATIO -
      frame.walkerHeight * CONTACT_FISH_TOUCH_HEIGHT_RATIO -
      frame.walkerBaseY,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

const getFooterRightLandingPose = (
  footer: HTMLElement,
  frame: ContactFrameMetrics,
  cellWidth: number,
) => {
  const footerRect = footer.getBoundingClientRect();

  return {
    phase: 'landed',
    x:
      footerRect.right -
      cellWidth * CONTACT_FOOTER_RIGHT_LANDING_GAP_CELLS -
      frame.walkerWidth -
      frame.walkerBaseX +
      (isMobileViewport()
        ? frame.walkerWidth * MOBILE_CONTACT_FOOTER_RIGHT_LANDING_WALKER_OFFSET_RATIO
        : 0),
    y:
      footerRect.top -
      frame.walkerHeight -
      frame.walkerBaseY +
      CONTACT_FOOTER_LANDING_SURFACE_OFFSET_Y,
    zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
  } satisfies WalkerOverridePose;
};

const getFooterRightExitPose = (landingPose: WalkerOverridePose, frame: ContactFrameMetrics) =>
  ({
    phase: 'second-run',
    x: window.innerWidth - frame.walkerBaseX + frame.walkerWidth * 1.5,
    y: landingPose.y,
    zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
  }) satisfies WalkerOverridePose;

const getFishBoneLandingPosition = (
  footer: HTMLElement,
  bone: HTMLImageElement,
  cellWidth: number,
) => {
  const footerRect = footer.getBoundingClientRect();
  const boneRect = bone.getBoundingClientRect();
  const landingGapCells = isMobileViewport()
    ? MOBILE_CONTACT_BONE_LANDING_GAP_CELLS
    : CONTACT_BONE_LANDING_GAP_CELLS;

  return {
    x: footerRect.right - cellWidth * landingGapCells - boneRect.width,
    y: footerRect.top - boneRect.height + CONTACT_FOOTER_LANDING_SURFACE_OFFSET_Y,
  };
};

const getContactRoutePose = (segments: ContactRouteSegment[], progress: number) =>
  getRoutePose(segments, progress, {
    getDefaultZIndex: () => WALKER_LAYER_IN_FRONT_OF_CONTENT,
  });

const getContactRouteSegments = (elements: ContactSceneElements, frame: ContactFrameMetrics) => {
  const routeSteps = elements.blockSevenSteps.slice(0, 2);
  const landingPose = getBlockSevenLandingPose(elements, frame);
  const firstStepCell = routeSteps.map((step) => getFirstFilledCell(step)).find((cell) => cell);

  if (!landingPose || !firstStepCell) {
    return [];
  }

  const firstCellRect = firstStepCell.getBoundingClientRect();
  const segments: ContactRouteSegment[] = [];
  let currentX = landingPose.x;
  let currentY = landingPose.y;

  for (const [index, step] of routeSteps.entries()) {
    const firstFilledCell = getFirstFilledCell(step);

    if (!firstFilledCell) {
      continue;
    }

    const stepRunY = getCellSurfaceY(firstFilledCell, frame);
    const stepLeftX = getStepLeftX(firstFilledCell, frame);

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

    if (currentX - stepLeftX > 0.5) {
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

    const nextStep = routeSteps[index + 1];

    if (!nextStep) {
      break;
    }

    const nextFirstFilledCell = getFirstFilledCell(nextStep);

    if (!nextFirstFilledCell) {
      continue;
    }

    const nextLeftX = getStepLeftX(nextFirstFilledCell, frame);
    const nextRunY = getCellSurfaceY(nextFirstFilledCell, frame);

    if (nextLeftX <= currentX + 0.5 && Math.abs(nextRunY - currentY) > 0.5) {
      segments.push({
        endX: currentX,
        endY: nextRunY,
        phase: 'second-fall',
        startX: currentX,
        startY: currentY,
        zIndex: WALKER_LAYER_BEHIND_CONTENT,
      });
      currentY = nextRunY;
      continue;
    }

    break;
  }

  const footerLandingPose = getFooterLandingPose(
    elements.footer,
    frame,
    currentX,
    firstCellRect.width,
  );
  const goalFlagStopPose = getGoalFlagStopPose(
    elements.goalFlag,
    footerLandingPose,
    frame,
    firstCellRect.width,
  );
  const footerJumpHeight = Math.max(
    Math.abs(currentX - footerLandingPose.x) * CONTACT_FOOTER_JUMP_HEIGHT_RATIO,
    frame.walkerHeight,
  );

  segments.push({
    arcHeight: footerJumpHeight,
    endX: footerLandingPose.x,
    endY: footerLandingPose.y,
    phase: 'second-fall',
    startX: currentX,
    startY: currentY,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  });
  segments.push({
    endX: goalFlagStopPose.x,
    endY: goalFlagStopPose.y,
    lengthMultiplier: CONTACT_GOAL_FLAG_APPROACH_LENGTH_MULTIPLIER,
    phase: 'second-run',
    startX: footerLandingPose.x,
    startY: footerLandingPose.y,
    zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
  });
  segments.push({
    endX: goalFlagStopPose.x,
    endY: goalFlagStopPose.y,
    phase: 'landed',
    startX: goalFlagStopPose.x,
    startY: goalFlagStopPose.y,
    zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
  });
  return segments;
};

const getRouteReferenceCell = (elements: ContactSceneElements) =>
  elements.blockSevenSteps
    .slice(0, 2)
    .map((step) => getFirstFilledCell(step))
    .find((cell) => cell);

const getRouteEndPose = (elements: ContactSceneElements, frame: ContactFrameMetrics) => {
  return getContactRoutePose(getContactRouteSegments(elements, frame), FULL_PROGRESS);
};

const setGoalFishVisible = (goalFish: HTMLImageElement, visible: boolean) => {
  goalFish.style.opacity = visible ? '1' : '0';
  goalFish.style.visibility = visible ? 'visible' : 'hidden';
};

const setWalkerSpriteVariant = (walker: WalkerRoot, variant: 'default' | 'fish' | 'love') => {
  walker.dataset.spriteVariant = variant;
};

const setGoalFishBoneVisible = (goalFishBone: HTMLImageElement, visible: boolean) => {
  goalFishBone.style.opacity = visible ? '1' : '0';
  goalFishBone.style.visibility = visible ? 'visible' : 'hidden';
};

const setGoalFishBonePosition = (goalFishBone: HTMLImageElement, x: number, y: number) => {
  goalFishBone.style.setProperty('--goal-fish-bone-x', `${x}px`);
  goalFishBone.style.setProperty('--goal-fish-bone-y', `${y}px`);
};

const getGoalFishBonePose = (
  startX: number,
  startY: number,
  landingPosition: { x: number; y: number },
  frame: ContactFrameMetrics,
  cellWidth: number,
  progress: number,
) => {
  const firstBounceDrift = cellWidth * CONTACT_BONE_FIRST_BOUNCE_DRIFT_CELLS;
  const bounceDrift = firstBounceDrift * CONTACT_BONE_SECOND_BOUNCE_DRIFT_RATIO;
  const firstBouncePeakHeight = Math.max(
    cellWidth * CONTACT_BONE_FIRST_BOUNCE_HEIGHT_RATIO * 10,
    frame.walkerHeight * CONTACT_BONE_FIRST_BOUNCE_HEIGHT_RATIO,
  );
  const bouncePeakHeight =
    firstBouncePeakHeight *
    (CONTACT_BONE_SECOND_BOUNCE_HEIGHT_RATIO / CONTACT_BONE_FIRST_BOUNCE_HEIGHT_RATIO);
  const bounceEndX = landingPosition.x - bounceDrift;

  if (progress <= CONTACT_BONE_THROW_LAND_END_PROGRESS) {
    const throwProgress = clamp(progress / CONTACT_BONE_THROW_LAND_END_PROGRESS, 0, FULL_PROGRESS);
    const throwJumpArc = 4 * throwProgress * (1 - throwProgress);
    const throwJumpHeight = Math.max(
      Math.abs(landingPosition.x - startX) * CONTACT_BONE_THROW_ARC_HEIGHT_RATIO,
      frame.walkerHeight * 1.5,
    );

    return {
      x: lerp(startX, landingPosition.x, throwProgress),
      y: lerp(startY, landingPosition.y, throwProgress) - throwJumpArc * throwJumpHeight,
    };
  }

  const bounceProgress = clamp(
    (progress - CONTACT_BONE_THROW_LAND_END_PROGRESS) /
      (FULL_PROGRESS - CONTACT_BONE_THROW_LAND_END_PROGRESS),
    0,
    FULL_PROGRESS,
  );
  const bounceArc = 4 * bounceProgress * (1 - bounceProgress);

  return {
    x: lerp(landingPosition.x, bounceEndX, bounceProgress),
    y: landingPosition.y - bounceArc * bouncePeakHeight,
  };
};

const getGoalFishJumpPose = (
  startPose: WalkerOverridePose,
  touchPose: WalkerOverridePose,
  frame: ContactFrameMetrics,
  progress: number,
) => {
  const jumpArc = 4 * progress * (1 - progress);
  const jumpHeight = Math.max(
    Math.abs(touchPose.x - startPose.x) * CONTACT_FISH_JUMP_ARC_HEIGHT_RATIO,
    frame.walkerHeight,
  );

  return {
    phase: progress >= FULL_PROGRESS ? 'second-fall' : 'second-fall',
    x: lerp(startPose.x, touchPose.x, progress),
    y: lerp(startPose.y, touchPose.y, progress) - jumpArc * jumpHeight,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

const getGoalFishFallPose = (
  touchPose: WalkerOverridePose,
  landingPose: WalkerOverridePose,
  progress: number,
) => {
  const easedProgress = progress * progress;

  return {
    phase: progress >= FULL_PROGRESS ? 'landed' : 'second-fall',
    x: lerp(touchPose.x, landingPose.x, progress),
    y: lerp(touchPose.y, landingPose.y, easedProgress),
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  } satisfies WalkerOverridePose;
};

export const contactScene: WalkerEffectScene = {
  id: 'contact',
  setup: () => {
    const elements = resolveContactSceneElements();

    if (!elements) {
      return;
    }

    const { anchor } = elements;

    anchor.__contactSceneCleanup__?.();

    const update = () => {
      const frame = measureContactFrame(elements);

      if (!getContactSceneReady()) {
        anchor.__contactSceneStartProgress__ = undefined;
        setGoalFishVisible(elements.goalFish, true);
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'default');
        return;
      }

      if (frame.progress <= 0 || frame.rawProgress <= 0) {
        setGoalFishVisible(elements.goalFish, true);
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'default');
        return;
      }

      anchor.__contactSceneStartProgress__ ??= frame.rawProgress;
      const { progress: localProgress, rawProgress: localRawProgress } = getLocalSceneProgress({
        progressMultiplier: isMobileViewport() ? MOBILE_SCENE_PROGRESS_MULTIPLIER : 1,
        rawProgress: frame.rawProgress,
        startProgress: anchor.__contactSceneStartProgress__,
      });
      const routePose = getContactRoutePose(
        getContactRouteSegments(elements, frame),
        clamp(localProgress / CONTACT_ROUTE_END_PROGRESS, 0, FULL_PROGRESS),
      );
      const routeEndPose = getRouteEndPose(elements, frame);
      const routeReferenceCell = getRouteReferenceCell(elements);

      if (!routeEndPose || !routeReferenceCell) {
        setGoalFishVisible(elements.goalFish, true);
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'default');
        return;
      }

      const cellWidth = routeReferenceCell.getBoundingClientRect().width;
      const fishTouchPose = getGoalFishTouchPose(elements.goalFish, frame);
      const footerRightLandingPose = getFooterRightLandingPose(elements.footer, frame, cellWidth);
      const footerRightExitPose = getFooterRightExitPose(footerRightLandingPose, frame);
      const fishBoneLandingPosition = getFishBoneLandingPosition(
        elements.footer,
        elements.goalFishBone,
        cellWidth,
      );

      if (localProgress <= CONTACT_ROUTE_END_PROGRESS) {
        setGoalFishVisible(elements.goalFish, true);
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'default');

        if (routePose) {
          setWalkerOverride(routePose);
        }
        return;
      }

      if (localProgress <= CONTACT_WAIT_END_PROGRESS) {
        setGoalFishVisible(elements.goalFish, true);
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'default');
        setWalkerOverride(routeEndPose);
        return;
      }

      if (localProgress <= CONTACT_FISH_JUMP_END_PROGRESS) {
        const fishJumpProgress = clamp(
          (localProgress - CONTACT_WAIT_END_PROGRESS) /
            (CONTACT_FISH_JUMP_END_PROGRESS - CONTACT_WAIT_END_PROGRESS),
          0,
          FULL_PROGRESS,
        );

        setGoalFishVisible(
          elements.goalFish,
          fishJumpProgress >= CONTACT_FISH_SPRITE_SWAP_PROGRESS ? false : true,
        );
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(
          elements.walker,
          fishJumpProgress >= CONTACT_FISH_SPRITE_SWAP_PROGRESS ? 'fish' : 'default',
        );
        setWalkerOverride(
          getGoalFishJumpPose(routeEndPose, fishTouchPose, frame, fishJumpProgress),
        );
        return;
      }

      const fishFallProgress = clamp(
        (localProgress - CONTACT_FISH_JUMP_END_PROGRESS) /
          (FULL_PROGRESS - CONTACT_FISH_JUMP_END_PROGRESS),
        0,
        FULL_PROGRESS,
      );

      setGoalFishVisible(elements.goalFish, false);
      if (localRawProgress <= FULL_PROGRESS) {
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(
          elements.walker,
          fishFallProgress >= FULL_PROGRESS ? 'love' : 'fish',
        );
        setWalkerOverride(
          getGoalFishFallPose(fishTouchPose, footerRightLandingPose, fishFallProgress),
        );
        return;
      }

      if (localRawProgress <= CONTACT_LOVE_HOLD_END_PROGRESS) {
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'love');
        setWalkerOverride(footerRightLandingPose);
        return;
      }

      const exitProgress = clamp(
        (localRawProgress - CONTACT_LOVE_HOLD_END_PROGRESS) /
          (CONTACT_RIGHT_EXIT_END_PROGRESS - CONTACT_LOVE_HOLD_END_PROGRESS),
        0,
        FULL_PROGRESS,
      );

      if (localRawProgress <= CONTACT_RIGHT_EXIT_END_PROGRESS) {
        setGoalFishBoneVisible(elements.goalFishBone, false);
        setWalkerSpriteVariant(elements.walker, 'fish');
        setWalkerOverride({
          phase: 'second-run',
          x: lerp(footerRightLandingPose.x, footerRightExitPose.x, exitProgress),
          y: footerRightLandingPose.y,
          zIndex: WALKER_LAYER_IN_FRONT_OF_CONTENT,
        });
        return;
      }

      const boneThrowProgress = clamp(
        (localRawProgress - CONTACT_RIGHT_EXIT_END_PROGRESS) /
          (CONTACT_BONE_THROW_END_PROGRESS - CONTACT_RIGHT_EXIT_END_PROGRESS),
        0,
        FULL_PROGRESS,
      );
      const boneStartX = window.innerWidth + frame.walkerWidth;
      const boneStartY = fishBoneLandingPosition.y;
      const bonePose = getGoalFishBonePose(
        boneStartX,
        boneStartY,
        fishBoneLandingPosition,
        frame,
        cellWidth,
        boneThrowProgress,
      );

      setGoalFishBoneVisible(elements.goalFishBone, true);
      setGoalFishBonePosition(elements.goalFishBone, bonePose.x, bonePose.y);
      setWalkerSpriteVariant(elements.walker, 'fish');
      setWalkerOverride(footerRightExitPose);
    };

    anchor.__contactSceneCleanup__ = setupEffectSceneLoop({
      onCleanup: () => {
        delete anchor.__contactSceneCleanup__;
        delete anchor.__contactSceneStartProgress__;
      },
      update,
    });
  },
};
