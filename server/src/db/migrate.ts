import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

// biome-ignore lint/style/noNonNullAssertion: <fights with ts>
const sql = postgres(process.env.DATABASE_URL!);

async function executeSqlFile(filePath: string): Promise<void> {
  const sqlContent = readFileSync(filePath, "utf-8");
  console.log(`Executing ${filePath}...`);

  try {
    await sql.unsafe(sqlContent);
    console.log(`✓ Successfully executed ${filePath}`);
  } catch (error) {
    console.error(`✗ Error executing ${filePath}:`, error);
    throw error;
  }
}

async function runMigrations(): Promise<void> {
  const schemaFile = join(process.cwd(), "sql", "schema.sql");
  console.log(`Executing schema from ${schemaFile}`);
  await executeSqlFile(schemaFile);

  console.log("\n✓ Schema migration completed successfully");
  await sql.end();
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
