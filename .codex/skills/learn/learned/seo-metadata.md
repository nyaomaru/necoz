# SEO Metadata

- Site-wide metadata defaults live in `src/lib/site-metadata.ts`.
- Document-level SEO tags are emitted by `src/layouts/Layout.astro`.
- Root-level text endpoints are implemented in `src/pages/robots.txt.ts` and `src/pages/sitemap.xml.ts`.
- Public OGP images should live in `public/` and be referenced with root-relative paths so generated metadata resolves cleanly against `SITE_URL`.
- After SEO changes, verify the built files in `dist/` to confirm canonical URLs, OGP tags, robots, and sitemap output.
