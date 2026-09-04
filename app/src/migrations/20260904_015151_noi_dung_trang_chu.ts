import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_home_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_home_stats_order_idx\` ON \`settings_home_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_home_stats_parent_id_idx\` ON \`settings_home_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_home_stats_locale_idx\` ON \`settings_home_stats\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`settings_home_about_points\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`icon\` text DEFAULT 'award',
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_home_about_points_order_idx\` ON \`settings_home_about_points\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_home_about_points_parent_id_idx\` ON \`settings_home_about_points\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_home_about_points_locale_idx\` ON \`settings_home_about_points\` (\`_locale\`);`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_hero_lead\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_hero_cta\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_hero_cta_secondary\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_about_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_services_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_services_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_branches_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_branches_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_knowledge_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_knowledge_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_social_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_social_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_cta_title\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_cta_subtitle\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_cta_button\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`footer_headings_about\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`footer_headings_quick_links\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`footer_headings_recent_posts\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`footer_headings_contact\` text;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`footer_headings_follow_us\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_home_stats\`;`)
  await db.run(sql`DROP TABLE \`settings_home_about_points\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_hero_lead\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_hero_cta\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_hero_cta_secondary\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_about_title\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_services_title\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_services_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_branches_title\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_branches_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_knowledge_title\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_knowledge_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_social_title\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_social_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_cta_title\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_cta_subtitle\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_cta_button\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`footer_headings_about\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`footer_headings_quick_links\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`footer_headings_recent_posts\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`footer_headings_contact\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`footer_headings_follow_us\`;`)
}
