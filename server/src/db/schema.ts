import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-typebox";

export interface ServiceTemplate {
  name: string;
  text: string;
  title?: string;
  description?: string;
  capacity?: number;
  cost?: number;
  leagueId?: number;
  categoryId?: number;
  currencyId?: number;
}

export type BadgeCondition = Record<string, unknown>;

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
]);
export const leagueStatusEnum = pgEnum("league_status", ["active", "inactive"]);
export const partyStatusEnum = pgEnum("party_status", [
  "gathering",
  "started",
  "ended",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "accepted",
  "rejected",
  "kicked",
]);
export const badgeRarityEnum = pgEnum("badge_rarity", [
  "common",
  "uncommon",
  "rare",
  "legendary",
]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  ign: varchar("ign", { length: 255 }).notNull(),
  oauth2: text("oauth2"),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  templates: jsonb("templates")
    .$type<ServiceTemplate[]>()
    .default(sql`'[]'::jsonb`)
    .notNull(),
  hostRating: numeric("host_rating", {
    precision: 5,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),
  customerRating: numeric("customer_rating", {
    precision: 5,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),
  hostThumbsUp: integer("host_thumbs_up").default(0).notNull(),
  hostThumbsDown: integer("host_thumbs_down").default(0).notNull(),
  customerThumbsUp: integer("customer_thumbs_up").default(0).notNull(),
  customerThumbsDown: integer("customer_thumbs_down").default(0).notNull(),
});

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: leagueStatusEnum("status").default("active").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 256 }).notNull(),
  imagePath: varchar("image_path", { length: 512 }),
  status: categoryStatusEnum("status").default("active").notNull(),
});

export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  description: text("description"),
  rarity: badgeRarityEnum("rarity").default("common").notNull(),
  condition: jsonb("condition").$type<BadgeCondition>().notNull(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  permissions: varchar("permissions", { length: 255 }).notNull(),
});

export const badgeCategories = pgTable(
  "badge_categories",
  {
    badgeId: integer("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.badgeId, table.categoryId] })],
);

export const earns = pgTable(
  "earns",
  {
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    badgeId: integer("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    pinned: boolean("pinned").default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.badgeId] })],
);

export const parties = pgTable(
  "parties",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    capacity: integer("capacity").notNull(),
    status: partyStatusEnum("status").default("gathering").notNull(),
    cost: integer("cost").notNull(),
    hostId: integer("host_id").references(() => players.id, {
      onDelete: "set null",
    }),
    leagueId: integer("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "restrict" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    currencyId: integer("currency_id")
      .notNull()
      .references(() => currencies.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("idx_active_party_search")
      .on(table.leagueId, table.categoryId)
      .where(sql`${table.status} = 'gathering'`),
    uniqueIndex("idx_one_active_party_per_host")
      .on(table.hostId)
      .where(sql`${table.status} in ('gathering', 'started')`),
  ],
);

export const ratings = pgTable(
  "ratings",
  {
    id: serial("id").primaryKey(),
    value: smallint("value").notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    giverId: integer("giver_id").references(() => players.id, {
      onDelete: "set null",
    }),
    receiverId: integer("receiver_id").references(() => players.id, {
      onDelete: "set null",
    }),
    partyId: integer("party_id").references(() => parties.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    unique("ratings_giver_receiver_party_unique").on(
      table.giverId,
      table.receiverId,
      table.partyId,
    ),
    check("ratings_value_check", sql`${table.value} in (1, -1)`),
  ],
);

export const applies = pgTable(
  "applies",
  {
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    partyId: integer("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    status: applicationStatusEnum("status").default("pending").notNull(),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.partyId] })],
);

export const CategorySchema = createSelectSchema(categories);
