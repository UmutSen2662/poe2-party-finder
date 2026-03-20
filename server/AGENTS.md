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
