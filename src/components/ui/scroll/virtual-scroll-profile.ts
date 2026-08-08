import { clamp } from '~/lib/math';

const TARGET_SCROLL_RANGE_RATIO = 0.75;
const SHORTEST_SECTION_COMPRESSION = 0.85;
const LONGEST_SECTION_COMPRESSION = 0.7;
const MIN_SECTION_COMPRESSION = 0.7;
const MAX_SECTION_COMPRESSION = 0.9;
const NORMALIZATION_STEPS = 40;

export type ScrollProfileSection = {
  height: number;
  offsetTop: number;
};

export type ScrollProfileSegment = {
  compression: number;
  virtualEnd: number;
  virtualStart: number;
  visualEnd: number;
  visualStart: number;
};

export type VirtualScrollProfile = {
  baseScrollRange: number;
  baseScrollRangeMultiplier: number;
  baseVirtualScrollRange: number;
  footerCompression: number;
  footerVirtualScrollRange: number;
  sceneToVisualScrollRatio: number;
  scrollRangeMultiplier: number;
  segments: ScrollProfileSegment[];
  virtualScrollRange: number;
};

type WeightedCompression = {
  rawCompression: number;
  weight: number;
};

const getRawSectionCompressions = (sections: ScrollProfileSection[]) => {
  const heights = sections.map(({ height }) => Math.max(height, 0));
  const minHeight = Math.min(...heights);
  const maxHeight = Math.max(...heights);
  const heightRange = maxHeight - minHeight;

  return heights.map((height) => {
    if (heightRange <= 0) {
      return TARGET_SCROLL_RANGE_RATIO;
    }

    const heightProgress = (height - minHeight) / heightRange;

    return (
      SHORTEST_SECTION_COMPRESSION +
      (LONGEST_SECTION_COMPRESSION - SHORTEST_SECTION_COMPRESSION) * heightProgress
    );
  });
};

const getNormalizedCompressions = (items: WeightedCompression[]) => {
  const totalWeight = items.reduce((total, { weight }) => total + weight, 0);

  if (totalWeight <= 0) {
    return items.map(() => TARGET_SCROLL_RANGE_RATIO);
  }

  let lowerScale = 0;
  let upperScale = 2;

  for (let index = 0; index < NORMALIZATION_STEPS; index += 1) {
    const scale = (lowerScale + upperScale) / 2;
    const weightedCompression = items.reduce(
      (total, { rawCompression, weight }) =>
        total +
        clamp(rawCompression * scale, MIN_SECTION_COMPRESSION, MAX_SECTION_COMPRESSION) * weight,
      0,
    );

    if (weightedCompression / totalWeight < TARGET_SCROLL_RANGE_RATIO) {
      lowerScale = scale;
    } else {
      upperScale = scale;
    }
  }

  return items.map(({ rawCompression }) =>
    clamp(rawCompression * upperScale, MIN_SECTION_COMPRESSION, MAX_SECTION_COMPRESSION),
  );
};

const createVisualSegments = (baseScrollRange: number, sections: ScrollProfileSection[]) => {
  if (baseScrollRange <= 0 || sections.length === 0) {
    return [];
  }

  return sections
    .map((section, index) => {
      const visualStart = index === 0 ? 0 : clamp(section.offsetTop, 0, baseScrollRange);
      const nextSection = sections[index + 1];
      const visualEnd = nextSection
        ? clamp(nextSection.offsetTop, visualStart, baseScrollRange)
        : baseScrollRange;

      return {
        sectionIndex: index,
        visualEnd,
        visualStart,
      };
    })
    .filter(({ visualEnd, visualStart }) => visualEnd > visualStart);
};

export const createVirtualScrollProfile = ({
  baseScrollRange,
  baseScrollRangeMultiplier,
  footerPinExtraScrollRange,
  scrollRangeMultiplier,
  sections,
}: {
  baseScrollRange: number;
  baseScrollRangeMultiplier: number;
  footerPinExtraScrollRange: number;
  scrollRangeMultiplier: number;
  sections: ScrollProfileSection[];
}): VirtualScrollProfile => {
  const normalizedBaseScrollRange = Math.max(baseScrollRange, 0);
  const normalizedFooterPinRange = Math.max(footerPinExtraScrollRange, 0);
  const normalizedSections = sections
    .filter(({ height, offsetTop }) => Number.isFinite(height) && Number.isFinite(offsetTop))
    .sort((left, right) => left.offsetTop - right.offsetTop);
  const profileSections =
    normalizedSections.length > 0
      ? normalizedSections
      : [{ height: normalizedBaseScrollRange, offsetTop: 0 }];
  const rawSectionCompressions = getRawSectionCompressions(profileSections);
  const visualSegments = createVisualSegments(normalizedBaseScrollRange, profileSections);
  const weightedCompressions: WeightedCompression[] = visualSegments.map(
    ({ sectionIndex, visualEnd, visualStart }) => ({
      rawCompression: rawSectionCompressions[sectionIndex] ?? TARGET_SCROLL_RANGE_RATIO,
      weight: (visualEnd - visualStart) * scrollRangeMultiplier,
    }),
  );
  const footerRawCompression = rawSectionCompressions.at(-1) ?? TARGET_SCROLL_RANGE_RATIO;

  weightedCompressions.push({
    rawCompression: footerRawCompression,
    weight: normalizedFooterPinRange,
  });

  const normalizedCompressions = getNormalizedCompressions(weightedCompressions);
  let nextVirtualStart = 0;
  const segments = visualSegments.map(({ visualEnd, visualStart }, index) => {
    const compression = normalizedCompressions[index] ?? TARGET_SCROLL_RANGE_RATIO;
    const virtualStart = nextVirtualStart;
    const virtualEnd =
      virtualStart + (visualEnd - visualStart) * scrollRangeMultiplier * compression;

    nextVirtualStart = virtualEnd;

    return {
      compression,
      virtualEnd,
      virtualStart,
      visualEnd,
      visualStart,
    } satisfies ScrollProfileSegment;
  });
  const footerCompression = normalizedCompressions.at(-1) ?? TARGET_SCROLL_RANGE_RATIO;
  const footerVirtualScrollRange = normalizedFooterPinRange * footerCompression;
  const sceneToVisualScrollRatio =
    baseScrollRangeMultiplier > 0 ? scrollRangeMultiplier / baseScrollRangeMultiplier : 1;

  return {
    baseScrollRange: normalizedBaseScrollRange,
    baseScrollRangeMultiplier,
    baseVirtualScrollRange: nextVirtualStart,
    footerCompression,
    footerVirtualScrollRange,
    sceneToVisualScrollRatio,
    scrollRangeMultiplier,
    segments,
    virtualScrollRange: nextVirtualStart + footerVirtualScrollRange,
  };
};

export const getVirtualScrollYForVisualScrollY = (
  profile: VirtualScrollProfile,
  visualScrollY: number,
) => {
  const clampedVisualScrollY = clamp(visualScrollY, 0, profile.baseScrollRange);
  const segment =
    profile.segments.find(({ visualEnd }) => clampedVisualScrollY <= visualEnd) ??
    profile.segments.at(-1);

  if (!segment) {
    return 0;
  }

  return (
    segment.virtualStart +
    (clampedVisualScrollY - segment.visualStart) *
      profile.scrollRangeMultiplier *
      segment.compression
  );
};

export const getScrollStateForVirtualScrollY = (
  profile: VirtualScrollProfile,
  virtualScrollY: number,
) => {
  const clampedVirtualScrollY = clamp(virtualScrollY, 0, profile.virtualScrollRange);

  if (clampedVirtualScrollY >= profile.baseVirtualScrollRange) {
    const footerVirtualScrollY = clampedVirtualScrollY - profile.baseVirtualScrollRange;
    const footerSceneScrollY =
      profile.baseScrollRangeMultiplier > 0 && profile.footerCompression > 0
        ? footerVirtualScrollY / (profile.baseScrollRangeMultiplier * profile.footerCompression)
        : 0;

    return {
      sceneScrollY: profile.baseScrollRange * profile.sceneToVisualScrollRatio + footerSceneScrollY,
      visualScrollY: profile.baseScrollRange,
    };
  }

  const segment =
    profile.segments.find(({ virtualEnd }) => clampedVirtualScrollY <= virtualEnd) ??
    profile.segments.at(-1);

  if (!segment) {
    return { sceneScrollY: 0, visualScrollY: 0 };
  }

  const segmentVirtualRangePerVisualPixel = profile.scrollRangeMultiplier * segment.compression;
  const visualScrollY =
    segment.visualStart +
    (segmentVirtualRangePerVisualPixel > 0
      ? (clampedVirtualScrollY - segment.virtualStart) / segmentVirtualRangePerVisualPixel
      : 0);

  return {
    sceneScrollY: visualScrollY * profile.sceneToVisualScrollRatio,
    visualScrollY,
  };
};
