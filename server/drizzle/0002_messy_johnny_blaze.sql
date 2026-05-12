ALTER TABLE "categories" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'active'::text;--> statement-breakpoint
UPDATE "categories" SET "status" = 'inactive' WHERE "status" = 'deleted';--> statement-breakpoint
DROP TYPE "public"."category_status";--> statement-breakpoint
CREATE TYPE "public"."category_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."category_status";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "status" SET DATA TYPE "public"."category_status" USING "status"::"public"."category_status";
