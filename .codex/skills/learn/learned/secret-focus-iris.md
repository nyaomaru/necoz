# Secret Focus Iris

**Captured:** 2026-11-14
**Context:** Use when a scroll-complete handoff must cover the viewport with a character-shaped iris, hold a loading frame, and reveal another page.
**Tags:** astro, typescript, animation, virtual-scroll

## Problem

The secret-page entrance is a full-viewport focus, not a walker scene. A black PNG with a transparent Nyaomaru cutout has to shrink from 3000px to 0 and grow back, while the area outside that image stays black. The public page also uses virtual scroll, so "finished scrolling" is the settled end of the virtual range, including the footer pin, rather than the visual content bottom. A full navigation would otherwise flash the next page before the loading frame can paint.

## Solution

- Dispatch `necoz:virtual-scroll-end` only when both the rendered and target virtual positions are within one pixel of the full range.
- Lock page scroll with `data-scroll-locked` on `documentElement` for the duration of the close.
- Scale the cutout PNG with `--secret-focus-size`. Keep four black bars in the space outside the image so a size below the viewport still covers the screen.
- At size 0, store `necoz-secret-entry=closed` and navigate to `/secret/`.
- On that page, an inline head script reads the same key and sets `data-secret-focus="loading"` before paint. The page module then holds the black loading frame for 2 seconds and grows the cutout from 0 to 3000 over 2 seconds.
- Remove the overlay after the open so the secret page is fully visible. Skip the iris when `prefers-reduced-motion: reduce` matches.

## Example

```ts
const atEnd = isVirtualScrollSettledAtEnd(
  renderedVirtualScrollY,
  targetVirtualScrollY,
  virtualScrollRange,
);

if (atEnd) {
  window.dispatchEvent(new CustomEvent('necoz:virtual-scroll-end'));
}
```

## When To Use

Use this for a page-to-page iris that must survive a navigation. Keep the cutout asset black outside the character and transparent inside it. Replace `public/assets/focus/nyaomaru-focus.png` without changing the size timing.

## Related Files

- `src/components/ui/layout/SecretFocusOverlay.astro`
- `src/lib/secret-focus/focus-transition.ts`
- `src/lib/secret-focus/setup-secret-focus.ts`
- `src/components/ui/scroll/virtual-scroll-end.ts`
- `src/components/ui/scroll/virtual-scroll-controller.ts`
- `src/layouts/Layout.astro`
- `src/pages/secret.astro`
