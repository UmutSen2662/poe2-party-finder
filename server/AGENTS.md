# Server AGENTS.md

**AI Context**: Bun + Elysia + Drizzle + PostgreSQL

## Architecture
- `src/routes/<feature>/index.ts` - Route definitions
- `src/routes/<feature>/*.service.ts` - Business logic  
- `src/db/schema.ts` - Database schema (source of truth)
- `src/index.ts` - Must export `type App = typeof app`

## Required Patterns
- Validate inputs with Elysia `t` schemas
- Use structured error logging in all database operations
- Use custom error classes from `src/lib/errors.ts`
- Keep uploads under `uploads/`

## Error Handling Pattern
```typescript
} catch (error) {
  console.error("Database error in operationName:", {
    error: error instanceof Error ? error.message : String(error),
    operation: "operationName",
    context: { relevantData }
  });
  throw new DatabaseError("User-friendly message");
}
```
Re-throw expected domain errors (`NotFoundError`, `ForbiddenError`,
`ValidationError`, `ConflictError`) **before** the catch-all logging branch
so they keep their original status codes and messages.

## Environment
```env
DATABASE_URL=postgres://user:password@localhost:5432/poe2_party_finder
UPLOAD_DIR=./uploads
```

## Commands
- `bun run db:generate` - Create migrations
- `bun run db:migrate` - Apply to database
- `bun run db:seed` - Reset with mock data
- `bunx drizzle-kit studio` - Database GUI
- `bun build src/index.ts --compile --outfile=poe2-server` - Build binary

## Import Aliases
- Use `@/*` for deep imports (avoid `../../`)
- Keep shallow imports relative

## Search Endpoints
List endpoints should accept the full filter set as query params; never
expect the client to post-filter results.

For `GET /parties` and `GET /parties/live` the supported filters are:
- `leagueId`, `categoryId`, `currencyId` — exact id matches
- `minHostRating` — `players.host_rating >= n`
- `includeUnrated` — when truthy combines with `minHostRating` as
  `host_rating >= n OR host_rating = 0`
- `minPrice` / `maxPrice` — inclusive `parties.cost` range
- `q` — case-insensitive `ILIKE '%q%'` on `parties.title` OR
  `parties.description`

Detail endpoints that feed list UIs (e.g. `GET /parties/:id`) should return
the **same joined shape** as the list endpoint, not a stripped-down
record. This lets clients patch a single item in their cached list without
shape conversions. The shared service for parties is `getSearchPartyById`.

## SearchPartyRow Shape
`searchParties` and `getSearchPartyById` both return `SearchPartyRow`,
which embeds joined `host`, `league`, `category`, `currency` objects and an
`acceptedCount` (count of `applies` rows with `status = 'accepted'`).
Compute `acceptedCount` with a correlated subquery — do **not** issue a
second round-trip per row.

## SSE Live Endpoints
- Route handler is an `async function*` that yields `sse({ event, data })`.
- Subscribers live in `src/lib/<feature>-live-events.ts` (see
  `party-live-events.ts`). Publishers call `publish<Feature><Action>(payload)`
  from inside the service after the DB write.
- A live endpoint **must** accept the same filter set as the corresponding
  list endpoint and apply those filters in `matchesFilters` before
  enqueueing events.
- Emit a `heartbeat` event every ~25s while there are subscribers so
  intermediaries don't close the connection.

## Seed Data
- `src/db/seed-data.ts` is the source of truth for local mock data; each
  table exports a `{ target, rows }` block and `seed.ts` picks them up
  automatically.
- Keep ratings in their domain range: `host_rating` / `customer_rating`
  are scored out of 10 (use decimals like `9.85`).
- Set `imagePath` / `icon` to `null` unless a matching file actually exists
  under `uploads/`. A non-null path with no file on disk shows up as a
  broken-image placeholder in the UI.
- Image paths must use the full route prefix the upload handler produces
  (e.g. `/categories/images/<uuid>.png`), not just a filename.
