# Repo Structure

- `src/pages/` contains route entrypoints and generated text endpoints.
- `src/layouts/Layout.astro` is the shared document shell and the main place for metadata concerns.
- `src/components/home/` contains homepage sections.
- `src/components/ui/` contains reusable primitives and shared shells.
- `src/lib/nyaomaru/` owns the walker runtime, scenes, and animation helpers.
- `src/styles/` contains global styling primitives, breakpoint helpers, and block-grid rules.
- `public/` serves assets directly and should be used for stable public URLs such as OGP images.
