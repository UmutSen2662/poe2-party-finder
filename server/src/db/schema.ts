import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "deleted",
]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 256 }).notNull(),
  imagePath: varchar("image_path", { length: 512 }),
  status: categoryStatusEnum("status").default("active").notNull(),
});
