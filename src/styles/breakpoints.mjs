export const BREAKPOINT_PIXELS = Object.freeze({
  phone: 430,
});

const pxToRem = (pixels) => `${pixels / 16}rem`;

export const BREAKPOINTS = Object.freeze({
  stageWide: pxToRem(2200),
  stageCompact: '116rem',
  desktopCompact: '75rem',
  contentCompact: '60rem',
  contentNarrow: '40rem',
  phone: pxToRem(BREAKPOINT_PIXELS.phone),
});

export const MEDIA_QUERIES = Object.freeze({
  stageWide: `(min-width: ${BREAKPOINTS.stageWide})`,
  stageCompact: `(max-width: ${BREAKPOINTS.stageCompact})`,
  desktopCompact: `(max-width: ${BREAKPOINTS.desktopCompact})`,
  contentCompact: `(max-width: ${BREAKPOINTS.contentCompact})`,
  contentNarrow: `(max-width: ${BREAKPOINTS.contentNarrow})`,
  phone: `(max-width: ${BREAKPOINTS.phone})`,
});
