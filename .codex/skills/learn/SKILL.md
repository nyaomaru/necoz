---
name: learn
description: Extract reusable patterns from non-trivial work in the necoz repository and store them as project knowledge. Use after meaningful architecture, animation, responsive, SEO, or debugging work.
---

# /learn - Capture Reusable necoz Patterns

Analyze the current session and capture reusable knowledge for this Astro-based corporate site.

This repository is not `is-kit`. It is the `necoz` website project, built around:

- `Astro` for route structure, document output, and SEO-sensitive HTML
- `React` for targeted interactive UI only
- `TypeScript` in `src/lib/nyaomaru/` for walker runtime, scene logic, and scroll-driven animation
- responsive DOM/layout variants for desktop and mobile
- custom virtual scroll behavior that separates visual scroll from scene progress

## Required Context

Before capturing a lesson:

1. Read `AGENTS.md`.
2. Read `learned/LEARNED_INDEX.md`.
3. Check whether the lesson is already covered in `.codex/skills/learn/learned/`.
4. Prefer extending existing project knowledge rather than creating overlapping notes.

## Auto-Activation Criteria

Consider auto-activating this skill when:

1. A non-trivial animation, scene, or walker behavior was fixed or redesigned.
2. A responsive behavior required different DOM, motion tuning, or scene math across breakpoints.
3. A virtual scroll, runtime state, or event coordination issue was diagnosed and resolved.
4. A reusable SEO, metadata, routing, or production-build constraint was discovered.
5. A verification or maintenance rule was clarified in a way that should guide future work.
6. A refactor changed responsibility boundaries between `Astro`, `React`, `TypeScript`, and direct DOM access.

Do not activate for:

- trivial copy edits
- cosmetic refactors with no lasting lesson
- one-line style changes
- obvious file moves with no design insight
- knowledge that is already documented clearly in `learned/`

## Manual Trigger

Run `/learn` after finishing meaningful implementation, debugging, refactoring, or architectural cleanup in `necoz`.

## What To Extract

### 1. Architecture And Responsibility Patterns

- Where should a concern live: `src/pages/`, `src/layouts/`, `src/components/`, or `src/lib/`?
- Why was a behavior kept in `TypeScript` instead of `React` state?
- Why was a page/layout concern kept in `Astro` instead of moving client-side?
- What responsibility boundary should future changes preserve?

Project-relevant examples:

- Keeping page shells and metadata in `Layout.astro`
- Keeping targeted interactivity in React islands only
- Keeping scene progression and walker logic in `src/lib/nyaomaru/`

### 2. Animation And Scene Patterns

- How was scene progress measured?
- What timing, phase, or easing decision mattered?
- What DOM measurements or runtime state were necessary?
- What should future animation changes avoid breaking?

Project-relevant examples:

- Mapping scroll progress to walker phases
- Using `requestAnimationFrame` plus DOM measurement for fine control
- Separating walker scenes from effect scenes

### 3. Responsive Motion Patterns

- What changed between desktop and mobile besides CSS?
- Did DOM structure, landing positions, scroll multipliers, or target elements differ?
- What breakpoint assumptions were encoded in logic?

Project-relevant examples:

- Using separate desktop and mobile block structures
- Switching active scene targets with `getVisibleElement`
- Adjusting virtual scroll density or scene progress for smaller viewports

### 4. Scroll And Runtime State Patterns

- Was native scroll used directly, or translated into virtual scene progress?
- What state was shared through runtime helpers?
- What event flow coordinated updates across scenes?

Project-relevant examples:

- Distinguishing `visualScrollY` from `sceneScrollY`
- Centralizing shared scroll state
- Driving scene updates via `necoz:virtual-scroll` and walker events

### 5. SEO And Production Output Patterns

- What metadata or route behavior needed to stay centralized?
- What only fails in production output?
- What must be verified in `dist/` after similar changes?

Project-relevant examples:

- Canonical and OGP behavior in `src/layouts/Layout.astro`
- Site-wide constants in `src/lib/site-metadata.ts`
- `robots.txt.ts` and `sitemap.xml.ts` generation

### 6. Verification Patterns

- What commands actually validated the change?
- Was `pnpm build` necessary because production output matters?
- Were there repo-specific pitfalls around formatting, linting, or tests?

Project-relevant examples:

- Always running `pnpm fmt` then `pnpm lint`
- Running `pnpm test` for logic and Astro checks
- Running `pnpm build` for rendering, routing, metadata, or asset changes

## Output Format

Create one file per pattern at:

`.codex/skills/learn/learned/[pattern-name].md`

Template:

````markdown
# [Descriptive Pattern Name]

**Captured:** YYYY-MM-DD
**Context:** [When this pattern applies]
**Tags:** astro, react, typescript, animation, virtual-scroll, responsive, seo, metadata, testing, etc.

## Problem

[Specific recurring problem this pattern solves]

## Solution

[Reusable approach, key decisions, constraints, and tradeoffs]

## Example

```ts
// Minimal real example from this codebase
```

## When To Use

[Trigger conditions for applying this pattern]

## Related Files

- `src/layouts/Layout.astro`
- `src/components/ui/scroll/virtual-scroll-controller.ts`
- `src/lib/nyaomaru/runtime-state.ts`
- `src/lib/nyaomaru/scenes/hero-scene.ts`
````

Use only the files that are actually relevant to the captured lesson.

## Process

1. Review the session for candidate lessons.
2. Select the highest-value reusable pattern(s).
3. Check existing learned notes to avoid duplication.
4. Draft the note in concrete, repo-specific language.
5. Save it to `.codex/skills/learn/learned/`.
6. Update `.codex/skills/learn/LEARNED_INDEX.md` with a one-line entry.

Index format:

- `**[pattern-name](learned/pattern-name.md)** - One-line summary.`

## Common Pattern Categories For This Repository

- Astro layout and metadata boundaries
- React island usage and hydration scope
- Virtual scroll architecture
- Scroll-driven animation timing and phase design
- Walker/runtime coordination
- Responsive DOM plus motion divergence
- Production-output SEO verification
- Formatting, linting, testing, and build validation rules

## Notes

- Capture only reusable, non-trivial lessons.
- Prefer lessons that explain both code placement and behavior.
- Favor concrete implementation constraints over abstract advice.
- If a change involved production rendering, SEO, or route output, mention the exact verification commands.
- Keep entries searchable and specific to `necoz`.
