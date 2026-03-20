# Website AGENTS.md

**AI Context**: Astro 6 + React 19 + Tailwind v4

## Architecture
- Build public pages with `.astro` files (zero-JS preferred)
- Use React islands only for interactive UI
- Load admin React apps with `client:only="react"` for SPA behavior
- Theme tokens in `shared/src/styles/theme.css`

## Required Patterns
- Keep public pages as close to zero-JS as possible
- Use `@/` path alias for `./src/` imports
- No shared global design tokens in this workspace

## Commands
- Dev server: `4321`
