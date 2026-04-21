import { pgTable, unique, serial, varchar, text, jsonb, check, numeric, integer, foreignKey, timestamp, smallint, primaryKey, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const admin = pgTable("admin", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	permissions: varchar({ length: 255 }).notNull(),
}, (table) => [
	unique("admin_email_key").on(table.email),
]);

export const badge = pgTable("badge", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 255 }),
	description: text(),
	condition: jsonb().notNull(),
});

export const category = pgTable("category", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	image: varchar({ length: 255 }),
	status: varchar({ length: 50 }).notNull(),
}, (table) => [
	check("category_status_check", sql`(status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[])`),
]);

export const account = pgTable("account", {
	id: serial().primaryKey().notNull(),
	ign: varchar({ length: 255 }).notNull(),
	oauth2: text().notNull(),
	templates: jsonb(),
	hostRating: numeric("host_rating", { precision: 5, scale:  2 }).default('0.00'),
	customerRating: numeric("customer_rating", { precision: 5, scale:  2 }).default('0.00'),
	hostThumbsUp: integer("host_thumbs_up").default(0),
	hostThumbsDown: integer("host_thumbs_down").default(0),
	customerThumbsUp: integer("customer_thumbs_up").default(0),
	customerThumbsDown: integer("customer_thumbs_down").default(0),
});

export const party = pgTable("party", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	capacity: integer().notNull(),
	status: varchar({ length: 50 }).notNull(),
	cost: integer().notNull(),
	hostId: integer("host_id"),
	leagueId: integer("league_id").notNull(),
	categoryId: integer("category_id").notNull(),
	currencyId: integer("currency_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hostId],
			foreignColumns: [account.id],
			name: "party_host_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.leagueId],
			foreignColumns: [league.id],
			name: "party_league_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "party_category_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.currencyId],
			foreignColumns: [currency.id],
			name: "party_currency_id_fkey"
		}).onDelete("restrict"),
	check("party_status_check", sql`(status)::text = ANY ((ARRAY['Gathering'::character varying, 'Started'::character varying, 'Ended'::character varying])::text[])`),
]);

export const league = pgTable("league", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	status: varchar({ length: 50 }).notNull(),
}, (table) => [
	check("league_status_check", sql`(status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[])`),
]);

export const currency = pgTable("currency", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	icon: varchar({ length: 255 }),
});

export const rating = pgTable("rating", {
	id: serial().primaryKey().notNull(),
	value: smallint().notNull(),
	timestamp: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	giverId: integer("giver_id"),
	receiverId: integer("receiver_id"),
	partyId: integer("party_id"),
}, (table) => [
	foreignKey({
			columns: [table.giverId],
			foreignColumns: [account.id],
			name: "rating_giver_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [account.id],
			name: "rating_receiver_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.partyId],
			foreignColumns: [party.id],
			name: "rating_party_id_fkey"
		}).onDelete("set null"),
	check("rating_value_check", sql`value = ANY (ARRAY[1, '-1'::integer])`),
]);

export const badgeCategory = pgTable("badge_category", {
	badgeId: integer("badge_id").notNull(),
	categoryId: integer("category_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badge.id],
			name: "badge_category_badge_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "badge_category_category_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.categoryId, table.badgeId], name: "badge_category_pkey"}),
]);

export const earns = pgTable("earns", {
	accountId: integer("account_id").notNull(),
	badgeId: integer("badge_id").notNull(),
	pinned: boolean().default(false),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.id],
			name: "earns_account_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badge.id],
			name: "earns_badge_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.badgeId, table.accountId], name: "earns_pkey"}),
]);

export const applies = pgTable("applies", {
	accountId: integer("account_id").notNull(),
	partyId: integer("party_id").notNull(),
	status: varchar({ length: 50 }).notNull(),
	appliedAt: timestamp("applied_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [account.id],
			name: "applies_account_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.partyId],
			foreignColumns: [party.id],
			name: "applies_party_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.partyId, table.accountId], name: "applies_pkey"}),
	check("applies_status_check", sql`(status)::text = ANY ((ARRAY['Pending'::character varying, 'Accepted'::character varying, 'Rejected'::character varying, 'Kicked'::character varying])::text[])`),
]);
