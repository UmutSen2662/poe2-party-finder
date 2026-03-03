import { sql } from "drizzle-orm";
import { db } from "./index";
import { categories, posts } from "./schema";
import { seedCategories, seedPosts } from "./seed-data";

async function seed() {
  console.log("🌱 Seeding database...");

  // Truncate all tables in one statement, reset serial IDs
  await db.execute(
    sql`TRUNCATE TABLE posts, categories RESTART IDENTITY CASCADE`,
  );

  // Insert seed data
  await db.insert(categories).values(seedCategories);
  console.log(`  ✓ Inserted ${seedCategories.length} categories`);

  await db.insert(posts).values(seedPosts);
  console.log(`  ✓ Inserted ${seedPosts.length} posts`);

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
