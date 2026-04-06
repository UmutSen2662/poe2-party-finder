CREATE TYPE "public"."category_status" AS ENUM('active', 'deleted');--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "image_path" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "status" "category_status" DEFAULT 'active' NOT NULL;