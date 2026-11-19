const SCROLL_END_EPSILON = 1;

export const isVirtualScrollSettledAtEnd = (
  renderedVirtualScrollY: number,
  targetVirtualScrollY: number,
  virtualScrollRange: number,
) =>
  virtualScrollRange > 0 &&
  renderedVirtualScrollY >= virtualScrollRange - SCROLL_END_EPSILON &&
  targetVirtualScrollY >= virtualScrollRange - SCROLL_END_EPSILON;
