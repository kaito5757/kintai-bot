CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_user_id" varchar(255) NOT NULL,
	"slack_channel_id" varchar(255),
	"action" varchar(50) NOT NULL,
	"timestamp" timestamp NOT NULL,
	"slack_timestamp" varchar(255) NOT NULL,
	"raw_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_session_id" uuid NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slack_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_channel_id" varchar(255) NOT NULL,
	"channel_name" varchar(255),
	"channel_type" varchar(50),
	"team_id" varchar(255),
	"is_active" varchar(10) DEFAULT 'true',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "slack_channels_slack_channel_id_unique" UNIQUE("slack_channel_id")
);
--> statement-breakpoint
CREATE TABLE "slack_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_user_id" varchar(255) NOT NULL,
	"username" varchar(255),
	"display_name" varchar(255),
	"real_name" varchar(255),
	"email" varchar(255),
	"team_id" varchar(255),
	"is_active" varchar(10) DEFAULT 'true',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "slack_users_slack_user_id_unique" UNIQUE("slack_user_id")
);
--> statement-breakpoint
CREATE TABLE "work_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slack_user_id" varchar(255) NOT NULL,
	"slack_channel_id" varchar(255),
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
