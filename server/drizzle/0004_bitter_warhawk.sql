ALTER TABLE "players" ALTER COLUMN "oauth2" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_email_unique" UNIQUE("email");