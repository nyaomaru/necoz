# Repository Guidelines

## Project Structure & Module Organization

- `src/pages/` holds route entrypoints and generated text endpoints such as `index.astro`, `privacy-policy.astro`, `robots.txt.ts`, and `sitemap.xml.ts`.
- `src/layouts/` contains shared page shells. `src/layouts/Layout.astro` is the central place for document metadata, canonical tags, OGP tags, and JSON-LD.
- `src/components/home/` contains homepage section shells such as hero, work, studio, and contact.
- `src/components/ui/` contains reusable primitives and shared UI systems:
  - `block/` for pixel block shapes and stacks.
  - `layout/` for structural shells such as header, footer, and section wrappers.
  - `mail/`, `scroll/`, `scene/`, `nyaomaru/`, and `text/` for focused UI behavior.
- `src/lib/` contains non-visual shared logic.
  - `src/lib/nyaomaru/` owns the walker runtime, scene models, route math, and animation helpers.
  - `src/lib/site-metadata.ts` owns site-wide SEO defaults and public URL constants.
- `src/styles/` contains global CSS, block-grid styles, breakpoint definitions, and the custom media token plugin.
- `public/` serves static files directly. Keep root-level public assets there when they need stable URLs, such as `public/necoz_ogp.png`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies.
- `pnpm dev`: run the local Astro dev server at `http://localhost:4321`.
- `pnpm build`: build the production site into `dist/`.
- `pnpm preview`: preview the production build locally.
- `pnpm test`: run Vitest, then Astro project checks.
- `pnpm test:unit`: run only Vitest.
- `pnpm lint`: run `oxlint --deny-warnings .`.
- `pnpm fmt`: run `oxfmt --write .`.
- `pnpm fmt:check`: verify formatting without modifying files.

## Session Start Rule

- Before making changes in this repository, read `learned/LEARNED_INDEX.md`.
- Treat `learned/LEARNED_INDEX.md` as required repo context, not optional notes.
- If a learned note applies to the task, follow it unless the user explicitly asks to override it.
- `../necoz-site/AGENTS.md` is a useful reference for tone and process, but this repository's local `AGENTS.md` and `learned/` notes take priority.

## Coding Style & Naming Conventions

- Use nearby files as the source of truth for structure and naming.
- Keep Astro pages and layouts thin. Push reusable UI into `src/components/` and shared logic into `src/lib/`.
- Keep animation and walker behavior inside `src/lib/nyaomaru/` and the related UI shells, not inside unrelated page files.
- Prefer targeted edits over broad refactors unless the task requires architectural cleanup.
- Route files in `src/pages/` should stay lower-case.
- Component files should use `PascalCase` where the existing codebase does.
- Do not introduce secrets, tokens, or private credentials into tracked files.

## SEO & Metadata Notes

- Keep site-wide metadata centralized in `src/lib/site-metadata.ts` and `src/layouts/Layout.astro`.
- Public SEO assets should live in `public/` so they resolve to stable root-relative URLs.
- When changing robots, sitemap, canonical URLs, or OGP behavior, verify the generated output in `dist/` with a production build.

## Testing Guidelines

- Collocate unit tests with the source files they cover using `*.test.ts` where possible.
- `pnpm test` is the baseline verification for logic and Astro checks.
- Run `pnpm build` for non-trivial UI, SEO, route, or asset changes because those often fail only in production output.

## Verification Rule

- After each code change, run `pnpm fmt`.
- After formatting, run `pnpm lint`.
- When behavior, routing, metadata, assets, or rendering changes, run `pnpm test` and `pnpm build`.
- If `pnpm fmt:check` fails in CI, fix formatting in the same turn before considering the task complete.

## Commit & Pull Request Guidelines

- Prefer Conventional Commit style commit titles, for example `feat: add homepage OGP image`.
- PR summaries should state user-facing changes, note verification performed, and include screenshots for visual changes when useful.
