# AGENTS.md

This monorepo contains the Path of Exile 2 desktop app, backend API, marketing site, and shared design tokens.

## Workspaces
- `client/` — React 19 + Tauri desktop app
- `server/` — Bun + Elysia + Drizzle API
- `website/` — Astro + React marketing site and admin UI
- `shared/` — shared CSS theme and design tokens

## Traffic Cop
- If you work on desktop UI, read `client/AGENTS.md`.
- If you work on API routes, database, or backend logic, read `server/AGENTS.md`.
- If you work on landing pages or admin web UI, read `website/AGENTS.md`.
- If you work on theme variables or shared styling, read `shared/AGENTS.md`.

## Global Rules
- Use Bun workspaces.
- Run `bun install` from the repo root.
- Use TypeScript 5.
- Use Biome for formatting and linting.
- Prefer root scripts when the task spans multiple workspaces.
- Do not duplicate theme tokens across apps. Shared design tokens belong in `shared/src/styles/theme.css`.

## Key Commands
- `bun run dev`
- `bun run check`
- `bun run typecheck`
