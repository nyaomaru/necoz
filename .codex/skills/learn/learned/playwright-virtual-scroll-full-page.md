# Playwright Full-Page Captures With Virtual Scroll

**Captured:** 2026-08-14
**Context:** Capturing full-page visual artifacts from the homepage in Playwright
**Tags:** playwright, virtual-scroll, responsive, testing, github-actions

## Problem

The homepage locks `html` and `body` with `overflow: hidden` and moves the page
through `[data-virtual-scroll-content]`. Playwright's `fullPage: true` expands
the capture surface, but it does not advance this custom visual-scroll state.
The resulting PNG can contain only the initial sections followed by a large
blank area.

## Solution

Build and serve the production output so development-only UI does not enter the
capture. After navigation and font loading, inject capture-only CSS that restores
native document overflow, pins the virtual-scroll content to `top: 0`, and hides
the fixed virtual scrollbar. Then use `fullPage: true` for each responsive
viewport. Keep this override in the Playwright script rather than production CSS
so runtime scroll behavior remains unchanged.

## Example

```js
await page.addStyleTag({
  content: `
    html.virtual-scroll-root,
    html.virtual-scroll-root body {
      height: auto !important;
      overflow: visible !important;
    }

    [data-virtual-scroll-content] {
      top: 0 !important;
    }

    [data-virtual-scrollbar] {
      display: none !important;
    }
  `,
});

await page.screenshot({ path, fullPage: true, animations: 'disabled' });
```

## When To Use

Use this for full-page screenshots, visual regression artifacts, or design
comparison captures of pages rendered through `VirtualScroll.astro`. Do not use
it when validating the virtual scrollbar, animated scene timing, or walker
handoffs; those need viewport captures taken while driving the real virtual
scroll input.

## Related Files

- `scripts/capture-screenshots.mjs`
- `.github/workflows/screenshot-email.yml`
- `src/components/ui/scroll/VirtualScroll.astro`
- `src/components/ui/scroll/virtual-scroll-controller.ts`
