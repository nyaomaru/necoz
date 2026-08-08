# Section-Weighted Virtual Scroll Compression

**Captured:** 2026-08-08
**Context:** Use when physical scroll effort must change without changing visual destinations, scene coordinates, or footer-pinned animation completion.
**Tags:** typescript, animation, virtual-scroll, responsive, testing

## Problem

The virtual scroll controller maps physical wheel distance to both visual content movement and a faster scene timeline. Multiplying the complete range by one constant shortens the page, but it accelerates every section equally. Short sections can then feel abrupt, and directly changing the existing visual or scene multipliers can break walker handoffs and the pinned Contact ending.

## Solution

Build a piecewise physical-scroll profile from the rendered section measurements while preserving the existing visual-to-scene coordinate ratio:

- Mark scene sections with a shared runtime data attribute and measure `offsetTop` plus `offsetHeight` after layout.
- Give shorter sections a weaker compression and taller sections a stronger compression using a linear slope.
- Include the footer-pinned range in the weighted calculation, using the final Contact section's compression.
- Normalize all section factors together so the complete physical range reaches the requested target exactly.
- Clamp each factor to a safe interval so no local section becomes disproportionately fast.
- Map physical virtual scroll to visual and scene coordinates piecewise. Continue to use the original visual-to-scene ratio and original final scene coordinate.
- Provide the inverse visual-to-virtual mapping for hash navigation.

## Example

```ts
const profile = createVirtualScrollProfile({
  baseScrollRange,
  baseScrollRangeMultiplier,
  footerPinExtraScrollRange,
  scrollRangeMultiplier,
  sections: sectionElements.map((section) => ({
    height: section.offsetHeight,
    offsetTop: section.offsetTop,
  })),
});

const { sceneScrollY, visualScrollY } = getScrollStateForVirtualScrollY(
  profile,
  renderedVirtualScrollY,
);
```

## When To Use

Use this when changing overall scroll effort on pages where section heights differ and animations depend on a separate scene timeline. Unit-test the total range ratio, compression bounds, forward/inverse mapping, and unchanged final scene coordinate. In a production preview, verify the measured section count and the final visual and scene positions after an End-key scroll.

## Related Files

- `src/components/ui/layout/SceneSection.astro`
- `src/components/ui/scroll/virtual-scroll-contracts.ts`
- `src/components/ui/scroll/virtual-scroll-controller.ts`
- `src/components/ui/scroll/virtual-scroll-navigation.ts`
- `src/components/ui/scroll/virtual-scroll-profile.ts`
- `src/components/ui/scroll/virtual-scroll-profile.test.ts`
