import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`service_nodes_hero_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_hero_stats_order_idx\` ON \`service_nodes_hero_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_hero_stats_parent_id_idx\` ON \`service_nodes_hero_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_hero_stats_locales\` (
  	\`value\` text NOT NULL,
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_hero_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_hero_stats_locales_locale_parent_id_unique\` ON \`service_nodes_hero_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_pricing_table_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_pricing_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_pricing_table_rows_order_idx\` ON \`service_nodes_blocks_pricing_table_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_pricing_table_rows_parent_id_idx\` ON \`service_nodes_blocks_pricing_table_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_pricing_table_rows_locales\` (
  	\`item\` text NOT NULL,
  	\`scope\` text,
  	\`fee\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_pricing_table_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_pricing_table_rows_locales_locale_paren\` ON \`service_nodes_blocks_pricing_table_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_pricing_table\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_pricing_table_order_idx\` ON \`service_nodes_blocks_pricing_table\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_pricing_table_parent_id_idx\` ON \`service_nodes_blocks_pricing_table\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_pricing_table_path_idx\` ON \`service_nodes_blocks_pricing_table\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_pricing_table_locales\` (
  	\`title\` text,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_pricing_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_pricing_table_locales_locale_parent_id_\` ON \`service_nodes_blocks_pricing_table_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_bullet_list_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_bullet_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_bullet_list_items_order_idx\` ON \`service_nodes_blocks_bullet_list_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_bullet_list_items_parent_id_idx\` ON \`service_nodes_blocks_bullet_list_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_bullet_list_items_locales\` (
  	\`text\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_bullet_list_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_bullet_list_items_locales_locale_parent\` ON \`service_nodes_blocks_bullet_list_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_bullet_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_bullet_list_order_idx\` ON \`service_nodes_blocks_bullet_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_bullet_list_parent_id_idx\` ON \`service_nodes_blocks_bullet_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_bullet_list_path_idx\` ON \`service_nodes_blocks_bullet_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_bullet_list_locales\` (
  	\`title\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_bullet_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_bullet_list_locales_locale_parent_id_un\` ON \`service_nodes_blocks_bullet_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_field_table_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_field_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_field_table_rows_order_idx\` ON \`service_nodes_blocks_field_table_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_field_table_rows_parent_id_idx\` ON \`service_nodes_blocks_field_table_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_field_table_rows_locales\` (
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_field_table_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_field_table_rows_locales_locale_parent_\` ON \`service_nodes_blocks_field_table_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_field_table\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_field_table_order_idx\` ON \`service_nodes_blocks_field_table\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_field_table_parent_id_idx\` ON \`service_nodes_blocks_field_table\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_field_table_path_idx\` ON \`service_nodes_blocks_field_table\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_field_table_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_field_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_field_table_locales_locale_parent_id_un\` ON \`service_nodes_blocks_field_table_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_rich_text_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_rich_text_block_order_idx\` ON \`service_nodes_blocks_rich_text_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_rich_text_block_parent_id_idx\` ON \`service_nodes_blocks_rich_text_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_rich_text_block_path_idx\` ON \`service_nodes_blocks_rich_text_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_rich_text_block_locales\` (
  	\`title\` text,
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_rich_text_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_rich_text_block_locales_locale_parent_i\` ON \`service_nodes_blocks_rich_text_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_cta_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`href\` text NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_cta_block_order_idx\` ON \`service_nodes_blocks_cta_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_cta_block_parent_id_idx\` ON \`service_nodes_blocks_cta_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_blocks_cta_block_path_idx\` ON \`service_nodes_blocks_cta_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_blocks_cta_block_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes_blocks_cta_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_blocks_cta_block_locales_locale_parent_id_uniq\` ON \`service_nodes_blocks_cta_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`parent_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`icon\` text,
  	\`image_id\` integer,
  	\`seo_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_slug_idx\` ON \`service_nodes\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_parent_idx\` ON \`service_nodes\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_image_idx\` ON \`service_nodes\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_seo_seo_image_idx\` ON \`service_nodes\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_updated_at_idx\` ON \`service_nodes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`service_nodes_created_at_idx\` ON \`service_nodes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`service_nodes_locales\` (
  	\`title\` text NOT NULL,
  	\`summary\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`service_nodes_locales_locale_parent_id_unique\` ON \`service_nodes_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text,
  	\`logo_id\` integer,
  	\`hero_image_id\` integer,
  	\`primary_color\` text,
  	\`hotline\` text,
  	\`hotline2\` text,
  	\`email\` text,
  	\`tax_code\` text,
  	\`facebook\` text,
  	\`tiktok\` text,
  	\`youtube\` text,
  	\`twitter\` text,
  	\`zalo_qr_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`zalo_qr_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_settings\`("id", "site_name", "logo_id", "hero_image_id", "primary_color", "hotline", "hotline2", "email", "tax_code", "facebook", "tiktok", "youtube", "twitter", "zalo_qr_id", "updated_at", "created_at") SELECT "id", "site_name", "logo_id", "hero_image_id", "primary_color", "hotline", "hotline2", "email", "tax_code", "facebook", "tiktok", "youtube", "twitter", "zalo_qr_id", "updated_at", "created_at" FROM \`settings\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_settings\` RENAME TO \`settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`settings_logo_idx\` ON \`settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_hero_image_idx\` ON \`settings\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_zalo_qr_idx\` ON \`settings\` (\`zalo_qr_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`service_nodes_id\` integer REFERENCES service_nodes(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_service_nodes_id_idx\` ON \`payload_locked_documents_rels\` (\`service_nodes_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`service_nodes_hero_stats\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_hero_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_pricing_table_rows\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_pricing_table_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_pricing_table\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_pricing_table_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_bullet_list_items\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_bullet_list_items_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_bullet_list\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_bullet_list_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_field_table_rows\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_field_table_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_field_table\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_field_table_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_rich_text_block\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_rich_text_block_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_cta_block\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_blocks_cta_block_locales\`;`)
  await db.run(sql`DROP TABLE \`service_nodes\`;`)
  await db.run(sql`DROP TABLE \`service_nodes_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`pages_id\` integer,
  	\`services_id\` integer,
  	\`categories_id\` integer,
  	\`media_id\` integer,
  	\`branches_id\` integer,
  	\`contact_submissions_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`branches_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "posts_id", "pages_id", "services_id", "categories_id", "media_id", "branches_id", "contact_submissions_id", "users_id") SELECT "id", "order", "parent_id", "path", "posts_id", "pages_id", "services_id", "categories_id", "media_id", "branches_id", "contact_submissions_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_branches_id_idx\` ON \`payload_locked_documents_rels\` (\`branches_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'Kế toán HiACC',
  	\`logo_id\` integer,
  	\`hero_image_id\` integer,
  	\`primary_color\` text DEFAULT '#CC1420',
  	\`hotline\` text,
  	\`hotline2\` text,
  	\`email\` text,
  	\`tax_code\` text,
  	\`facebook\` text,
  	\`tiktok\` text,
  	\`youtube\` text,
  	\`twitter\` text,
  	\`zalo_qr_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`zalo_qr_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_settings\`("id", "site_name", "logo_id", "hero_image_id", "primary_color", "hotline", "hotline2", "email", "tax_code", "facebook", "tiktok", "youtube", "twitter", "zalo_qr_id", "updated_at", "created_at") SELECT "id", "site_name", "logo_id", "hero_image_id", "primary_color", "hotline", "hotline2", "email", "tax_code", "facebook", "tiktok", "youtube", "twitter", "zalo_qr_id", "updated_at", "created_at" FROM \`settings\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_settings\` RENAME TO \`settings\`;`)
  await db.run(sql`CREATE INDEX \`settings_logo_idx\` ON \`settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_hero_image_idx\` ON \`settings\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_zalo_qr_idx\` ON \`settings\` (\`zalo_qr_id\`);`)
}
