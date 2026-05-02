# necoz

Necoz B.V. website built with Astro, React islands, and custom scroll / walker animation logic.

Scroll down and enjoy the animations!

You can check it on mobile too 😸

## Project Structure

The project is organized like this:

```text
/
├── public/                     # Static files served as-is
├── src/
│   ├── components/
│   │   ├── home/               # Homepage sections
│   │   └── ui/                 # Reusable UI primitives and shared shells
│   │       ├── block/
│   │       ├── button/
│   │       ├── layout/
│   │       ├── mail/
│   │       ├── nyaomaru/
│   │       ├── scene/
│   │       ├── scroll/
│   │       └── text/
│   ├── layouts/                # Shared page layout shells
│   ├── lib/                    # Non-visual shared logic
│   │   ├── nyaomaru/           # Walker controller, scene logic, scene models
│   │   ├── math.ts
│   │   └── site-links.ts
│   ├── pages/                  # Route entrypoints
│   │   ├── index.astro
│   │   └── privacy-policy.astro
│   ├── styles/                 # Global CSS, block grid, breakpoint helpers
│   └── types/                  # Project-level type declarations when needed
├── package.json
└── pnpm-lock.yaml
```

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:4321` and have fun scrolling.
