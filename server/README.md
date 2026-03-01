# Server Documentation (Elysia + Drizzle)

This workspace contains the backend API and database schemas for the Path of Exile 2 Party Finder.

## Database & Migrations Workflow

We use **Drizzle ORM** to manage our PostgreSQL database. Migrations and schema changes are executed strictly using Drizzle Kit.

### 1. Configure the `.env` file
Before the server can run or migrations can be applied, ensure you have a valid Postgres database running. Create a `.env` file inside the `server/` directory:

```env
# server/.env
DATABASE_URL=postgres://demo_user:demo_password@localhost:5432/poe2_party_finder
```

### 2. Drizzle Commands (Run from `server/` folder)
If you change `src/db/schema.ts` to add new tables or columns, you must apply those changes:

```bash
cd server
bunx drizzle-kit generate  # Generates the SQL migration files in the `drizzle/` directory
bunx drizzle-kit push      # Pushes your fresh schema changes directly to the database
```
*(Note: These commands can also be run from the root directory using `bun run db:generate` and `bun run db:migrate`).*

If you want to view the data currently in the database via a web GUI:
```bash
cd server
bunx drizzle-kit studio
```

---

## Detailed Directory Structure

- `src/`
  - `db/`
    - `schema.ts`: Defines our database tables using Drizzle's `pgTable`.
    - `index.ts`: Creates the live Drizzle connection to the Postgres database.
  - `routes/`
    - `app.ts`: The main Elysia server setup (Swagger, CORS, etc.).
      - **Crucially: `export type App = typeof app;`** (This type is imported by the frontend).
    - `*/`: Modular feature-based route definitions (e.g., `posts/posts.ts`).
- `drizzle/`: Auto-generated SQL files created by `drizzle-kit generate`. Do not edit these directly.

---

## Developing Endpoints

We use **Elysia.js** for its exceptional speed and its deep integration with TypeScript.

### Strict Validation (`t`)
Always use Elysia's `t` schema validator to define what query parameters, body payloads, or headers your endpoints require.

1. **It secures the backend**: Rejects bad client payloads automatically.
2. **It powers the frontend**: The `t` definitions are instantly converted into TypeScript definitions for the Eden client.

```typescript
import { Elysia, t } from "elysia";

export const app = new Elysia()
  // The frontend will now know exactly what body to send, and what it gets back
  .post("/party/create", ({ body }) => {
    // Save to database...
    return { success: true, partyId: "123" };
  }, {
    body: t.Object({
      title: t.String(),
      maxPlayers: t.Number(),
      description: t.Optional(t.String())
    })
  });

// MUST EXPORT THIS
export type App = typeof app;
```

### Viewing Backend Documentation
Since we use the `@elysiajs/swagger` plugin, you can view the auto-generated interactive OpenAPI documentation by navigating to your local server (usually port 3000) when running:
`http://localhost:3000/swagger`