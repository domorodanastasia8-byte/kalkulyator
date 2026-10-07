CREATE TABLE `workbook_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`telegram` text NOT NULL,
	`sphere` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`consent_version` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `workbook_leads_token` ON `workbook_leads` (`token_hash`);--> statement-breakpoint
CREATE INDEX `workbook_leads_date` ON `workbook_leads` (`created_at`);