# SQL Migration System

This directory contains raw SQL files that are the source of truth for your database schema.

## How It Works

- `schema.sql` defines the database structure (tables, constraints, etc.)
- `seed.sql` contains initial data for populating the database
- The migration utility (`src/db/migrate.ts`) executes `schema.sql` via Drizzle's PostgreSQL connection
- The seeding utility (`src/db/seed-sql.ts`) executes `seed.sql` via Drizzle's PostgreSQL connection
- No TypeScript schema matching required - SQL is executed directly

## Workflow

### To run migrations:
```bash
bun run reset   # Drops the database
bun run migrate # Executes schema.sql to create tables
```

### To seed the database:
```bash
bun run seed    # Executes seed.sql to populate with test data
```

### To modify the database schema:
1. Edit `schema.sql` in this directory
2. Run `bun run reset` to clear the database
3. Run `bun run migrate` to apply schema changes
4. Run `bun run seed` to populate with test data (optional)

### To modify seed data:
1. Edit `seed.sql` in this directory
2. Run `bun run seed` to populate with updated test data

## Notes

- The `migrate` command only executes `schema.sql`
- The `seed` command only executes `seed.sql`
- These are separate operations so you can apply schema changes without re-seeding
- The `DATABASE_URL` environment variable must be set in `.env`
- Tables use `SERIAL PRIMARY KEY` for auto-incrementing IDs
- Foreign key constraints are enforced, so ensure referenced data exists
