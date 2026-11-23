import type {
  CollisionMotionSnapshot,
  WalkerRouteSegment,
  WorkFrameMetrics,
  WorkSceneElements,
} from './model/work';
import {
  CENTER_RATIO,
  FULL_PROGRESS,
  STUDIO_DESK_JUMP_HEIGHT_RATIO,
  STUDIO_DESK_LANDING_X_OFFSET,
  STUDIO_DESK_LANDING_Y_OFFSET,
  STUDIO_DESK_LANDING_Y_RATIO,
  WALKER_EFFECT_Y_OFFSET,
  WALKER_PLUMBER_ENTER_RATIO,
  WALKER_PLUMBER_LANDING_OFFSET_Y,
  WALKER_RUN_SURFACE_OFFSET_Y,
} from './model/work';
import { getRoutePose } from './helpers/route-pose';
import { isMobileViewport, MOBILE_WALKER_SURFACE_LIFT_Y } from './helpers/viewport';
import {
  WALKER_LAYER_BEHIND_CONTENT,
  WALKER_LAYER_IN_FRONT_OF_CONTENT,
  WALKER_LAYER_IN_STRUCTURE,
  getDefaultWalkerLayer,
} from './helpers/layers';
import { SCENE_DOM_ATTRIBUTES } from './dom-contracts';

type WorkWalkerRunElements = Pick<WorkSceneElements, 'blockThreeTarget' | 'mobileBlockTarget'>;
type WorkBlockFourRouteElements = Pick<
  WorkSceneElements,
  | 'blockThreeFirstRow'
  | 'blockThreeThirdRow'
  | 'blockFourExit'
  | 'blockFourSteps'
  | 'mobileBlockTarget'
  | 'studioDesk'
>;

const getWalkerSurfaceY = (surface: HTMLElement, frame: WorkFrameMetrics) =>
  surface.getBoundingClientRect().top +
  WALKER_RUN_SURFACE_OFFSET_Y -
  frame.walkerHeight -
  frame.walkerBaseY +
  WALKER_EFFECT_Y_OFFSET +
  (isMobileViewport() ? MOBILE_WALKER_SURFACE_LIFT_Y : 0);

export const getWalkerRunY = (
  { blockThreeTarget, mobileBlockTarget }: WorkWalkerRunElements,
  frame: WorkFrameMetrics,
) =>
  getWalkerSurfaceY(
    isMobileViewport() ? (mobileBlockTarget ?? blockThreeTarget) : blockThreeTarget,
    frame,
  );

const getBlockFourRunY = (segment: HTMLElement, frame: WorkFrameMetrics) =>
  getWalkerSurfaceY(segment, frame);

const getBlockFourEdgeX = (segment: HTMLElement, frame: WorkFrameMetrics) => {
  const segmentRect = segment.getBoundingClientRect();

  return segmentRect.left + segmentRect.width - frame.walkerBaseX;
};

const getBlockFourExitState = (exitElement: HTMLElement, frame: WorkFrameMetrics) => {
  const exitRect = exitElement.getBoundingClientRect();

  return {
    hiddenY: exitRect.bottom - frame.walkerBaseY + WALKER_EFFECT_Y_OFFSET,
    startX:
      exitRect.left +
      exitRect.width * CENTER_RATIO -
      frame.walkerRect.width * CENTER_RATIO -
      frame.walkerBaseX,
    startY:
      exitRect.top +
      WALKER_PLUMBER_LANDING_OFFSET_Y -
      frame.walkerHeight -
      frame.walkerBaseY +
      WALKER_EFFECT_Y_OFFSET,
  };
};

const getStudioDeskLandingState = (studioDesk: HTMLImageElement, frame: WorkFrameMetrics) => {
  const deskRect = studioDesk.getBoundingClientRect();

  return {
    jumpHeight: Math.max(frame.walkerRect.height * STUDIO_DESK_JUMP_HEIGHT_RATIO, 36),
    x:
      deskRect.left +
      deskRect.width * CENTER_RATIO -
      frame.walkerRect.width * CENTER_RATIO -
      frame.walkerBaseX +
      STUDIO_DESK_LANDING_X_OFFSET,
    y:
      deskRect.top +
      deskRect.height * STUDIO_DESK_LANDING_Y_RATIO -
      frame.walkerHeight -
      frame.walkerBaseY +
      WALKER_EFFECT_Y_OFFSET +
      STUDIO_DESK_LANDING_Y_OFFSET,
  };
};

const pushVerticalSegmentIfNeeded = (
  segments: WalkerRouteSegment[],
  current: { x: number; y: number },
  nextY: number,
  phase: WalkerRouteSegment['phase'] = 'second-fall',
) => {
  if (Math.abs(nextY - current.y) <= 0.5) {
    return;
  }

  segments.push({
    endX: current.x,
    endY: nextY,
    phase,
    startX: current.x,
    startY: current.y,
  });
  current.y = nextY;
};

const pushHorizontalSegmentIfNeeded = (
  segments: WalkerRouteSegment[],
  current: { x: number; y: number },
  nextX: number,
) => {
  if (Math.abs(nextX - current.x) <= 0.5) {
    return;
  }

  segments.push({
    endX: nextX,
    endY: current.y,
    phase: 'second-run',
    startX: current.x,
    startY: current.y,
  });
  current.x = nextX;
};

const pushDeskLandingSegments = (
  segments: WalkerRouteSegment[],
  current: { x: number; y: number },
  deskLanding: ReturnType<typeof getStudioDeskLandingState>,
) => {
  segments.push({
    arcHeight: deskLanding.jumpHeight,
    endX: deskLanding.x,
    endY: deskLanding.y,
    phase: 'second-fall',
    startX: current.x,
    startY: current.y,
    zIndex: WALKER_LAYER_BEHIND_CONTENT,
  });
  segments.push({
    endX: deskLanding.x,
    endY: deskLanding.y,
    phase: 'landed',
    startX: deskLanding.x,
    startY: deskLanding.y,
    zIndex: WALKER_LAYER_IN_STRUCTURE,
  });
};

const getMobileBlockThreeRouteSegments = (
  {
    blockThreeFirstRow,
    blockThreeThirdRow,
    mobileBlockTarget,
    studioDesk,
  }: Pick<
    WorkBlockFourRouteElements,
    'blockThreeFirstRow' | 'blockThreeThirdRow' | 'mobileBlockTarget' | 'studioDesk'
  >,
  frame: WorkFrameMetrics,
) => {
  const exitState = getBlockFourExitState(mobileBlockTarget ?? blockThreeFirstRow, frame);
  const deskLanding = getStudioDeskLandingState(studioDesk, frame);
  const firstRowRunY = getBlockFourRunY(blockThreeFirstRow, frame);
  const firstRowEdgeX = getBlockFourEdgeX(blockThreeFirstRow, frame);
  const thirdRowRunY = getBlockFourRunY(blockThreeThirdRow, frame);
  const thirdRowEdgeX = getBlockFourEdgeX(blockThreeThirdRow, frame);
  const segments: WalkerRouteSegment[] = [];
  const current = {
    x: exitState.startX,
    y: exitState.hiddenY,
  };

  pushVerticalSegmentIfNeeded(segments, current, exitState.startY, 'landed');
  pushVerticalSegmentIfNeeded(segments, current, firstRowRunY);
  pushHorizontalSegmentIfNeeded(segments, current, firstRowEdgeX);
  pushVerticalSegmentIfNeeded(segments, current, thirdRowRunY);
  pushHorizontalSegmentIfNeeded(segments, current, thirdRowEdgeX);
  pushDeskLandingSegments(segments, current, deskLanding);

  return segments;
};

export const getWalkerRoutePose = (segments: WalkerRouteSegment[], progress: number) => {
  return getRoutePose(segments, progress, {
    getCompletedZIndex: () => WALKER_LAYER_BEHIND_CONTENT,
    getDefaultZIndex: (segment) => getDefaultWalkerLayer(segment.phase),
    resolveZIndex: ({ segment, segmentProgress }) => {
      const isDescendingDesktopFall =
        !isMobileViewport() && segment.phase === 'second-fall' && segment.endY > segment.startY;
      const isMobileEmergenceSegment =
        isMobileViewport() && segment.phase === 'landed' && segment.endY < segment.startY;

      if (isMobileEmergenceSegment && segmentProgress >= FULL_PROGRESS) {
        return WALKER_LAYER_BEHIND_CONTENT;
      }

      if (isDescendingDesktopFall && !segment.zIndex) {
        return WALKER_LAYER_IN_FRONT_OF_CONTENT;
      }

      return undefined;
    },
  });
};

export const getBlockFourRouteSegments = (
  {
    blockThreeFirstRow,
    blockThreeThirdRow,
    blockFourExit,
    blockFourSteps,
    mobileBlockTarget,
    studioDesk,
  }: WorkBlockFourRouteElements,
  frame: WorkFrameMetrics,
) => {
  if (isMobileViewport()) {
    return getMobileBlockThreeRouteSegments(
      { blockThreeFirstRow, blockThreeThirdRow, mobileBlockTarget, studioDesk },
      frame,
    );
  }

  const routeSteps = blockFourSteps.filter((step) => {
    const stepOrder = Number(step.getAttribute(SCENE_DOM_ATTRIBUTES.work.step));

    return Number.isFinite(stepOrder) && stepOrder <= 5;
  });
  const exitState = getBlockFourExitState(blockFourExit, frame);
  const deskLanding = getStudioDeskLandingState(studioDesk, frame);
  const segments: WalkerRouteSegment[] = [];
  const current = {
    x: exitState.startX,
    y: exitState.hiddenY,
  };

  pushVerticalSegmentIfNeeded(segments, current, exitState.startY, 'landed');

  routeSteps.forEach((segment, index) => {
    const runY = getBlockFourRunY(segment, frame);
    const edgeX = getBlockFourEdgeX(segment, frame);
    const nextSegment = routeSteps[index + 1];

    pushVerticalSegmentIfNeeded(segments, current, runY);

    if (!nextSegment) {
      pushDeskLandingSegments(segments, current, deskLanding);
      return;
    }

    pushHorizontalSegmentIfNeeded(segments, current, edgeX);
    pushVerticalSegmentIfNeeded(segments, current, getBlockFourRunY(nextSegment, frame));
  });

  return segments;
};

export const createCollisionMotionSnapshot = (
  elements: WorkBlockFourRouteElements & WorkWalkerRunElements,
  frame: WorkFrameMetrics,
): CollisionMotionSnapshot => {
  const plumberLandingX =
    frame.plumberRect.left +
    frame.plumberRect.width * CENTER_RATIO -
    frame.walkerRect.width * CENTER_RATIO -
    frame.walkerBaseX;
  const plumberLandingY =
    frame.plumberRect.top +
    WALKER_PLUMBER_LANDING_OFFSET_Y -
    frame.walkerHeight -
    frame.walkerBaseY +
    WALKER_EFFECT_Y_OFFSET;
  const walkerEnterY =
    frame.plumberRect.top +
    frame.plumberRect.height * WALKER_PLUMBER_ENTER_RATIO -
    frame.walkerHeight -
    frame.walkerBaseY +
    WALKER_EFFECT_Y_OFFSET;

  return {
    blockFourRouteSegments: getBlockFourRouteSegments(elements, frame),
    walkerRunY: getWalkerRunY(elements, frame),
    plumberLandingX,
    plumberLandingY,
    walkerEnterY,
  };
};
