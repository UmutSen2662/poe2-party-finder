import { getTableName, is, sql, Table } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "./index";
import * as schema from "./schema";
import * as seedExports from "./seed-data";

/** Auto-built from all table exports in schema.ts — no manual listing needed. */
const tableMap: Record<string, PgTable> = {};
for (const value of Object.values(schema)) {
  if (is(value, Table)) {
    tableMap[getTableName(value)] = value as PgTable;
  }
}

/** Seed entry shape: a target table name and rows to insert. */
interface SeedBlock {
  target: string;
  rows: Record<string, unknown>[];
}

/**
 * Main seed function — resets the database and populates it with
 * deterministic dev data from seed-data.ts.
 *
 * This function is fully generic: adding new tables to seed only
 * requires a new export in seed-data.ts (and the table in schema.ts).
 * No changes needed here.
 */
async function seed() {
  console.log("🌱 Seeding database...");

  // Gather every exported seed block from seed-data.ts.
  // Each block has a `target` (SQL table name) and `rows` (data to insert).
  // Using Object.values() means any new `export const` is picked up automatically.
  const seedBlocks = Object.values(seedExports) as SeedBlock[];

  // Validate that every target in the seed data matches an actual table
  // in schema.ts. Fails fast with a clear error if a target name is wrong
  // (e.g. typo like "categorie" instead of "categories").
  for (const { target } of seedBlocks) {
    if (!tableMap[target]) {
      throw new Error(`Unknown seed target: "${target}"`);
    }
  }

  // Build a comma-separated list of table names (e.g. "categories, posts")
  // and wipe all their data in a single SQL statement.
  // RESTART IDENTITY resets auto-increment IDs back to 1.
  // CASCADE removes any rows in other tables that depend on these via foreign keys.
  const tableNames = seedBlocks.map((s) => s.target).join(", ");
  await db.execute(
    sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`),
  );

  // Loop through each seed block and bulk-insert its rows into the
  // corresponding Drizzle table object. The order of exports in
  // seed-data.ts controls insert order — important when tables have
  // foreign key dependencies on each other.
  for (const { target, rows } of seedBlocks) {
    try {
      await db.insert(tableMap[target]).values(rows);
      console.log(`  ✓ Inserted ${rows.length} ${target}`);
    } catch {
      // Bulk insert failed — retry each row individually to find the bad one(s).
      console.error(
        `\n  ✗ Bulk insert into "${target}" failed. Identifying bad row(s)...`,
      );

      for (let i = 0; i < rows.length; i++) {
        try {
          await db.insert(tableMap[target]).values(rows[i]);
        } catch (rowErr: unknown) {
          const pgError = (rowErr as { cause?: Record<string, string> }).cause;
          const detail = pgError?.detail ?? pgError?.message ?? String(rowErr);
          const column = pgError?.column_name
            ? ` (column: "${pgError.column_name}")`
            : "";

          console.error(`    Row ${i + 1}${column}: ${detail}`);
          console.error(`    → ${JSON.stringify(rows[i])}\n`);
        }
      }

      process.exit(1);
    }
  }

  console.log("✅ Seed complete");
  // Explicitly exit because the database connection would otherwise
  // keep the Node/Bun process alive indefinitely.
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
