# Virtual Scroll End Controls

**Captured:** 2026-11-19
**Context:** Add viewport-fixed controls that navigate to the start or end of a virtual-scroll page.
**Tags:** astro, typescript, virtual-scroll, accessibility

## Problem

The document does not use native scrolling: content moves separately from a virtual timeline that can continue after the visual footer reaches the viewport edge. Native `window.scrollTo` and visual position alone cannot navigate to or identify the true end of that timeline.

## Solution

Render fixed controls outside the virtual-scroll content and have the controller navigate to zero or `virtualScrollRange` through its existing smooth-scroll target. Derive the control state from the rendered virtual position, not the requested target or the visual position, so it switches only when motion reaches the end. Respect reduced-motion preferences with an immediate scroll and keep the button's accessible label synchronized.

## When To Use

Use for scroll-to-start/end controls on virtual-scroll pages. Verify both directions at desktop and phone widths, including the footer-pinned range and positioning against surrounding UI.

## Related Files

- `src/components/ui/scroll/VirtualScroll.astro`
- `src/components/ui/scroll/virtual-scroll-controller.ts`
- `src/components/ui/scroll/virtual-scroll-profile.ts`
