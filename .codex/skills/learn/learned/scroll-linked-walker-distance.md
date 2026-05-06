# Scroll Linked Walker Distance

**Captured:** 2026-05-06
**Context:** Use when a walker scene needs a different visual travel distance without changing the scroll distance or phase timing.
**Tags:** typescript, animation, walker, virtual-scroll, testing

## Problem

Walker scene progress is normalized from scroll distance, while each phase maps that progress to measured DOM coordinates. Changing `scrollEnd` or a motion portion changes the perceived timing of the whole scene; sometimes the desired change is only that nyaomaru starts farther away or travels farther within the same phase duration.

## Solution

Keep `scrollEnd` and `MOTION_PORTIONS` unchanged when the scroll duration should stay the same. Instead, change the measured layout coordinate used by the affected phase. For offscreen hero starts, calculate the transform from the fixed walker base position and the measured walker width so the rendered sprite begins one full width outside the viewport.

## Example

```ts
const walkerComputedStyle = window.getComputedStyle(walker);
const walkerBaseX = Number.parseFloat(walkerComputedStyle.left) || 0;

return {
  layout: {
    startX: -(walkerBaseX + walkerRect.width),
  },
};
```

## When To Use

Use this when tuning walker travel distance but preserving scroll-linked timing, especially in hero or handoff phases. Add a focused unit test around the measured layout value so future visual tweaks do not accidentally re-anchor the start position.

## Related Files

- `src/lib/nyaomaru/scenes/hero-scene.ts`
- `src/lib/nyaomaru/scenes/model/hero.ts`
- `src/lib/nyaomaru/scenes/hero-scene.test.ts`
