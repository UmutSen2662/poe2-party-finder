# AGENTS.md

## Stack
- Bun runtime
- Elysia.js
- Drizzle ORM
- PostgreSQL

## Rules
- Keep route definitions under `src/routes/<feature>/`.
- Keep business logic in feature service files.
- Always export `type App = typeof app` from `src/index.ts`.
- Always validate endpoint inputs with Elysia `t` schemas.
- Treat `src/db/schema.ts` as the single source of truth for database structure.
- Do not hand-edit generated files in `drizzle/`.
- Keep uploads under `uploads/`.

## Schema Workflow
- After schema changes, run `bun run db:generate`.
- After schema changes, run `bun run db:migrate`.

## Environment
- `server/.env` must provide `DATABASE_URL`.
- `server/.env` must provide `UPLOAD_DIR`.
