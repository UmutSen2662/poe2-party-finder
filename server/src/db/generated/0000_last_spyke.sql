-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "admin" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"permissions" varchar(255) NOT NULL,
	CONSTRAINT "admin_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "badge" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255),
	"description" text,
	"condition" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar(255),
	"status" varchar(50) NOT NULL,
	CONSTRAINT "category_status_check" CHECK ((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"ign" varchar(255) NOT NULL,
	"oauth2" text NOT NULL,
	"templates" jsonb,
	"host_rating" numeric(5, 2) DEFAULT '0.00',
	"customer_rating" numeric(5, 2) DEFAULT '0.00',
	"host_thumbs_up" integer DEFAULT 0,
	"host_thumbs_down" integer DEFAULT 0,
	"customer_thumbs_up" integer DEFAULT 0,
	"customer_thumbs_down" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "party" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"capacity" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"cost" integer NOT NULL,
	"host_id" integer,
	"league_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"currency_id" integer NOT NULL,
	CONSTRAINT "party_status_check" CHECK ((status)::text = ANY ((ARRAY['Gathering'::character varying, 'Started'::character varying, 'Ended'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "league" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL,
	CONSTRAINT "league_status_check" CHECK ((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "currency" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "rating" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" smallint NOT NULL,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"giver_id" integer,
	"receiver_id" integer,
	"party_id" integer,
	CONSTRAINT "rating_value_check" CHECK (value = ANY (ARRAY[1, '-1'::integer]))
);
--> statement-breakpoint
CREATE TABLE "badge_category" (
	"badge_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "badge_category_pkey" PRIMARY KEY("category_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "earns" (
	"account_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"pinned" boolean DEFAULT false,
	CONSTRAINT "earns_pkey" PRIMARY KEY("badge_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "applies" (
	"account_id" integer NOT NULL,
	"party_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"applied_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "applies_pkey" PRIMARY KEY("party_id","account_id"),
	CONSTRAINT "applies_status_check" CHECK ((status)::text = ANY ((ARRAY['Pending'::character varying, 'Accepted'::character varying, 'Rejected'::character varying, 'Kicked'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "public"."account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."party"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_category" ADD CONSTRAINT "badge_category_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_category" ADD CONSTRAINT "badge_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earns" ADD CONSTRAINT "earns_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earns" ADD CONSTRAINT "earns_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applies" ADD CONSTRAINT "applies_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applies" ADD CONSTRAINT "applies_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."party"("id") ON DELETE cascade ON UPDATE no action;
*/