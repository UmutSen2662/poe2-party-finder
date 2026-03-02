CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(256) NOT NULL,
	"image_path" varchar(512) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
