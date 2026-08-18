ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "github" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "theme" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;