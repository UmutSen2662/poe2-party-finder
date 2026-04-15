import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(databaseUrl);

async function resetDatabase(): Promise<void> {
  console.log("Resetting database...");

  try {
    // Get database name from connection string
    const dbUrl = new URL(databaseUrl as string);
    const dbName = dbUrl.pathname.slice(1);

    // Connect to postgres database to drop the target database
    const adminUrl = (databaseUrl as string).replace(dbName, "postgres");
    const adminSql = postgres(adminUrl);

    // Drop and recreate database
    await adminSql.unsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    await adminSql.unsafe(`CREATE DATABASE "${dbName}"`);

    await adminSql.end();

    console.log("  ✓ Database dropped and recreated");
    console.log("\n✓ Database reset complete");
  } catch (error) {
    console.error("✗ Error resetting database:", error);
    throw error;
  }

  await sql.end();
}

resetDatabase().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
