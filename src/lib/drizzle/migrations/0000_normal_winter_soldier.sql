CREATE TABLE `question_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_slug` text NOT NULL,
	`resource_key` text NOT NULL,
	`question_id` text NOT NULL,
	`selected_answer` text NOT NULL,
	`correct_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resource_progress` (
	`module_slug` text NOT NULL,
	`resource_key` text NOT NULL,
	`completed_at` integer,
	`last_reviewed_at` integer,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`module_slug`, `resource_key`)
);
--> statement-breakpoint
CREATE TABLE `resource_visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_slug` text NOT NULL,
	`resource_key` text NOT NULL,
	`visited_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module_slug` text NOT NULL,
	`resource_key` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
