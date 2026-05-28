CREATE TYPE "public"."badge_rarity" AS ENUM('common', 'uncommon', 'rare', 'legendary');--> statement-breakpoint
ALTER TABLE "badges" ADD COLUMN "rarity" "badge_rarity" DEFAULT 'common' NOT NULL;