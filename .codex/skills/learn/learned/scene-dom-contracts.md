# Scene DOM Contracts

**Captured:** 2026-05-04
**Context:** Use when scene runtime code measures or mutates Astro-rendered DOM by data attributes, phase values, or class selectors.
**Tags:** astro, typescript, animation, walker, dom, responsive

## Problem

The walker scenes depend on DOM attributes emitted by Astro components. If runtime selectors and markup attributes are hard-coded independently, a rename can silently break scene measurement, phase updates, mobile target selection, or cross-scene handoff.

## Solution

Keep scene data attributes, selector strings, phase values, and runtime-critical class names in one TypeScript contract module under `src/lib/nyaomaru/scenes/`. Astro components that produce scene targets should import the attribute/class constants, while scene controllers and helpers should import the corresponding selectors.

This preserves the existing boundary: Astro owns static markup and responsive DOM variants, while `src/lib/nyaomaru/` owns non-visual runtime logic. CSS selectors can remain literal where they are purely styling, but anything read by TypeScript should go through the contract.

## Example

```ts
export const SCENE_DOM_ATTRIBUTES = {
  walker: 'data-nyaomaru-walker',
  work: {
    anchor: 'data-work-scene-anchor',
    phase: 'data-work-scene-phase',
  },
} as const;

export const SCENE_DOM_SELECTORS = {
  walker: '[data-nyaomaru-walker]',
  work: {
    anchor: '[data-work-scene-anchor]',
  },
} as const;
```

## When To Use

Use this pattern when adding or renaming scene anchors, targets, effect sprites, phase states, walker handoff markers, or DOM classes that scene TypeScript queries. Verify with `pnpm fmt`, `pnpm lint`, `pnpm test`, and `pnpm build` because both Astro output and runtime scene resolution are involved.

## Related Files

- `src/lib/nyaomaru/scenes/dom-contracts.ts`
- `src/lib/nyaomaru/scenes/work-scene.ts`
- `src/lib/nyaomaru/scenes/studio-scene.ts`
- `src/lib/nyaomaru/scenes/contact-scene.ts`
- `src/components/home/HeroIntro.astro`
- `src/components/home/WorkSection.astro`
