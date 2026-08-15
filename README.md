# necoz

<img
  src="https://raw.githubusercontent.com/nyaomaru/necoz/main/public/necoz_ogp.png"
  alt="necoz logo"
/>

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

## Screenshot Email Workflow

`.github/workflows/screenshot-email.yml` builds the site after `main` is
updated, captures full-page PC and mobile screenshots, uploads them as a
seven-day Actions artifact, and sends both PNG files through Gmail SMTP.

Configure these repository Actions secrets before running the workflow:

- `SCREENSHOT_MAIL_USERNAME`: Gmail address used as the sender.
- `SCREENSHOT_MAIL_APP_PASSWORD`: Google app password for the sender account.
- `SCREENSHOT_MAIL_TO`: Recipient address. When omitted, screenshots are sent
  to `SCREENSHOT_MAIL_USERNAME`.

The sender Google account must have 2-Step Verification enabled before an app
password can be created.
