# Server Documentation (Elysia + Drizzle)

This workspace contains the backend API and database schemas for the Path of Exile 2 Party Finder.

## Database & Migrations Workflow

We use **Drizzle ORM** to manage our PostgreSQL database.

### How the pieces fit together

There are 3 key files:

| File | Purpose |
|---|---|
| `drizzle.config.ts` | Tells the Drizzle CLI where your schema file is, where to output migrations, and how to connect to Postgres |
| `src/db/schema.ts` | **The source of truth.** You define all your tables here using TypeScript. This is the only file you edit when changing the database structure |
| `src/db/index.ts` | Creates the live database connection. Every handler imports `db` from here to run queries |

### 1. Configure the `.env` file
Before the server can run or migrations can be applied, ensure you have a valid Postgres database running. Create a `.env` file inside the `server/` directory:

```env
# server/.env
DATABASE_URL=postgres://demo_user:demo_password@localhost:5432/poe2_party_finder
UPLOAD_DIR=./uploads
```

### 2. Defining tables in `schema.ts`
Tables are defined using `pgTable`. Each column has a type (`varchar`, `text`, `integer`, `timestamp`, etc.) and optional constraints (`.notNull()`, `.primaryKey()`, `.defaultNow()`):

```typescript
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

When you want to add a new table, you simply add another `pgTable` call in this file.

### 3. Applying changes to the database
After editing `schema.ts`, you must push those changes to your actual Postgres database:

```bash
cd server
bunx drizzle-kit generate  # Creates SQL migration files in the drizzle/ directory
bunx drizzle-kit push      # Pushes schema changes directly to the database (best for dev)
```
*(These commands can also be run from the root directory using `bun run db:generate` and `bun run db:migrate`).*

### 4. Querying the database in your code
Import `db` from `@/db` and use the Drizzle query API:

```typescript
import { db } from "@/db";
import { posts } from "@/db/schema";

// Get all posts, newest first
const allPosts = await db.query.posts.findMany({
  orderBy: [desc(posts.createdAt)],
});

// Insert a new post
const [newPost] = await db.insert(posts)
  .values({ title: "My Post", content: "Hello world" })
  .returning();
```

Everything here is fully typed — `newPost` will automatically have `id`, `title`, `content`, and `createdAt` properties with the correct types.

### 5. Viewing your data
To browse the database via a web GUI:
```bash
cd server
bunx drizzle-kit studio
```

### 6. Seeding the database (dev data)

To keep local databases consistent across all devs, we have a seed script that **clears everything and inserts fixed mock data**:

```bash
bun run db:seed
```

This runs `server/src/db/seed.ts`, which:
1. **Truncates** all tables and resets auto-increment IDs back to 1
2. **Inserts** the mock data defined in `server/src/db/seed-data.ts`

#### Editing seed data

To add or change test data, edit `src/db/seed-data.ts` and run `bun run db:seed` again. The data is deterministic — no randomness — so both machines always get identical rows with identical IDs.

> **Note:** If you add a new table to `schema.ts`, remember to:
> 1. Add its seed data to `seed-data.ts`
> 2. Add the table name to the `TRUNCATE` statement in `seed.ts`
> 3. Add an `insert` call in `seed.ts`

---

## Detailed Directory Structure

- `src/`
  - `index.ts`: The server entry point (Swagger, CORS, etc.).
    - **Crucially: `export type App = typeof app;`** (This type is imported by the frontend).
  - `db/`
    - `schema.ts`: Defines our database tables using Drizzle's `pgTable`.
    - `index.ts`: Creates the live Drizzle connection to the Postgres database.
    - `seed.ts`: Executable seed script — truncates tables and inserts mock data.
    - `seed-data.ts`: Mock data arrays for seeding. Edit this to change dev test data.
  - `routes/`
    - `api.ts`: Central route aggregator — imports and `.use()`s every feature plugin.
    - `posts/`: Post-related endpoints.
      - `index.ts`: Elysia plugin with route definitions.
      - `posts.service.ts`: Database queries and business logic.
    - `categories/`: Category-related endpoints (CRUD for admin-managed categories).
      - `index.ts`: Elysia plugin with route definitions.
      - `categories.service.ts`: Database queries and business logic.
- `uploads/`: Local image storage (gitignored). On VPS, configured via `UPLOAD_DIR` env var.
  - `images/`: Admin-uploaded category images, etc.
- `drizzle/`: Auto-generated SQL files created by `drizzle-kit generate`. Do not edit these directly.

### Routing Architecture

We follow the **Router-Controller (Pure Router Composition)** pattern. The entry point (`src/index.ts`) mounts `routes/api.ts`, which aggregates all feature plugins. Each feature lives in its own folder and is self-contained. To add a new feature, create a new folder under `routes/`, define your routes, and register it in `api.ts`.

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

---

## Deployment

Because the server runs on Bun, deploying is as simple as compiling the project into a single executable binary. This bundles the backend code, Elysia, and Drizzle into one portable file that can be distributed.

```bash
cd server
bun build src/index.ts --compile --outfile=poe2-server
```

You can then run `./poe2-server` (`poe2-server.exe` on Windows) on your target machine. 
*Note: You will still need to provide the `.env` variables (like `DATABASE_URL` and `UPLOAD_DIR`) in the environment where the executable runs.*

---

## Import Aliases

The server workspace uses a minimal `@/*` TypeScript path alias to avoid deep relative imports. Use it for imports that would otherwise require `../../` or more:

```typescript
// Use @ alias for deep paths
import { db } from "@/db";
import { posts } from "@/db/schema";
import { CategorySchema } from "@/db/schema";

// Keep shallow relative imports local
import { getAllPosts } from "./posts.service";
```

This keeps imports readable while avoiding the overhead of fully aliasing every same-folder import.