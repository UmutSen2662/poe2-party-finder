import { getTableName, is, Table } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "./index";
import * as schema from "./schema";
import * as seedExports from "./seed-data";

const tableMap: Record<string, PgTable> = {};
for (const value of Object.values(schema)) {
  if (is(value, Table)) {
    tableMap[getTableName(value)] = value as PgTable;
  }
}

interface SeedBlock {
  target: string;
  rows: Record<string, unknown>[];
}

async function seed() {
  console.log("Seeding database...");

  const seedBlocks = Object.values(seedExports) as SeedBlock[];

  for (const { target } of seedBlocks) {
    if (!tableMap[target]) {
      throw new Error(`Unknown seed target: "${target}"`);
    }
  }

  try {
    await db.transaction(async (tx) => {
      for (const { target } of [...seedBlocks].reverse()) {
        await tx.delete(tableMap[target]);
      }

      for (const { target, rows } of seedBlocks) {
        if (rows.length === 0) {
          continue;
        }

        await tx.insert(tableMap[target]).values(rows);
        console.log(`  Inserted ${rows.length} ${target}`);
      }
    });
  } catch (error) {
    const operationError = error as {
      cause?: Record<string, string>;
      message?: string;
    };

    console.error("Seed failed during transaction:", {
      error:
        operationError.cause?.detail ??
        operationError.cause?.message ??
        operationError.message ??
        String(error),
      operation: "seed",
    });
    process.exit(1);
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
