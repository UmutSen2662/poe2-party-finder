import { readFileSync } from "node:fs";
import postgres from "postgres";

// biome-ignore lint/style/noNonNullAssertion: <fights with ts>
const sql = postgres(process.env.DATABASE_URL!);

async function seed(): Promise<void> {
	const seedFilePath = join(process.cwd(), "sql", "seed.sql");
	const sqlContent = readFileSync(seedFilePath, "utf-8");

	console.log("Seeding database from seed.sql...");

	try {
		await sql.unsafe(sqlContent);
		console.log("✓ Successfully seeded database");
	} catch (error) {
		console.error("✗ Error seeding database:", error);
		throw error;
	}

	await sql.end();
}

import { join } from "node:path";

seed().catch((error) => {
	console.error("Seed failed:", error);
	process.exit(1);
});
