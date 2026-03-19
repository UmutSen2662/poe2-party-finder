# AGENTS.md

## Stack
- Astro 6
- React 19
- Tailwind CSS v4

## Rules
- Build public pages with `.astro` files first.
- Keep public pages as close to zero-JS as possible.
- Use React islands only for interactive UI.
- Load admin React apps with `client:only="react"` when full SPA behavior is needed.
- Keep theme tokens in `shared/src/styles/theme.css`.
- Do not define shared global design tokens in this workspace.
- Use the `@/` path alias for `./src/` imports.

## Runtime
- Dev server port: `4321`
