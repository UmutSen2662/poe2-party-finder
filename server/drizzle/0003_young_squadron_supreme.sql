CREATE TYPE "public"."application_status" AS ENUM('pending', 'accepted', 'rejected', 'kicked');--> statement-breakpoint
CREATE TYPE "public"."league_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."party_status" AS ENUM('gathering', 'started', 'ended');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"permissions" varchar(255) NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "applies" (
	"player_id" integer NOT NULL,
	"party_id" integer NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applies_player_id_party_id_pk" PRIMARY KEY("player_id","party_id")
);
--> statement-breakpoint
CREATE TABLE "badge_categories" (
	"badge_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "badge_categories_badge_id_category_id_pk" PRIMARY KEY("badge_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255),
	"description" text,
	"condition" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "earns" (
	"player_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	CONSTRAINT "earns_player_id_badge_id_pk" PRIMARY KEY("player_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "league_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"capacity" integer NOT NULL,
	"status" "party_status" DEFAULT 'gathering' NOT NULL,
	"cost" integer NOT NULL,
	"host_id" integer,
	"league_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"currency_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"ign" varchar(255) NOT NULL,
	"oauth2" text NOT NULL,
	"templates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"host_rating" numeric(5, 2) DEFAULT 0 NOT NULL,
	"customer_rating" numeric(5, 2) DEFAULT 0 NOT NULL,
	"host_thumbs_up" integer DEFAULT 0 NOT NULL,
	"host_thumbs_down" integer DEFAULT 0 NOT NULL,
	"customer_thumbs_up" integer DEFAULT 0 NOT NULL,
	"customer_thumbs_down" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" smallint NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"giver_id" integer,
	"receiver_id" integer,
	"party_id" integer,
	CONSTRAINT "ratings_value_check" CHECK ("ratings"."value" in (1, -1)),
	CONSTRAINT "ratings_giver_receiver_party_unique" UNIQUE("giver_id","receiver_id","party_id")
);
--> statement-breakpoint
ALTER TABLE "applies" ADD CONSTRAINT "applies_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applies" ADD CONSTRAINT "applies_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_categories" ADD CONSTRAINT "badge_categories_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_categories" ADD CONSTRAINT "badge_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earns" ADD CONSTRAINT "earns_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earns" ADD CONSTRAINT "earns_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parties" ADD CONSTRAINT "parties_host_id_players_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parties" ADD CONSTRAINT "parties_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parties" ADD CONSTRAINT "parties_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parties" ADD CONSTRAINT "parties_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_giver_id_players_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_receiver_id_players_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_active_party_search" ON "parties" USING btree ("league_id","category_id") WHERE "parties"."status" = 'gathering';--> statement-breakpoint
CREATE UNIQUE INDEX "idx_one_active_party_per_host" ON "parties" USING btree ("host_id") WHERE "parties"."status" in ('gathering', 'started');
