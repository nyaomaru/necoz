# Validation

- Always run `pnpm fmt` after editing tracked files.
- Always run `pnpm lint` after formatting.
- Run `pnpm test` when logic, components, pages, or metadata behavior changes.
- Run `pnpm build` when changing routes, SEO output, static assets, or anything that affects generated production HTML.
- If CI fails on `pnpm fmt:check`, fix formatting before closing the task.
