import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Collection mới `PricingPlans` (khách feedback 12/09: /bang-gia cần nơi tự
 * set nội dung trong admin). Viết tay theo mẫu `20260906_132705_them_van_ban_phap_luat.ts`
 * vì `migrate:create` không tự sinh được — 4 migration liền trước thiếu file
 * snapshot `.json` đi kèm nên drizzle-kit không xác định được baseline đúng.
 *
 * Bắt buộc phải có file này: Payload chỉ tự đẩy schema khi
 * NODE_ENV !== 'production'. Thiếu migration thì bảng không tồn tại và MỌI
 * truy vấn /bang-gia chết 500 trong khi deploy vẫn báo thành công.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pricing_plans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`service_group_id\` integer NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`service_group_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_plans_service_group_idx\` ON \`pricing_plans\` (\`service_group_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_updated_at_idx\` ON \`pricing_plans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_created_at_idx\` ON \`pricing_plans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans_locales\` (
  	\`name\` text NOT NULL,
  	\`price\` text NOT NULL,
  	\`summary\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pricing_plans_locales_locale_parent_id_unique\` ON \`pricing_plans_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_plans_features_order_idx\` ON \`pricing_plans_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_features_parent_id_idx\` ON \`pricing_plans_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans_features_locales\` (
  	\`text\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_plans_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pricing_plans_features_locales_locale_parent_id_unique\` ON \`pricing_plans_features_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pricing_plans_id\` integer REFERENCES pricing_plans(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pricing_plans_id_idx\` ON \`payload_locked_documents_rels\` (\`pricing_plans_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pricing_plans_features_locales\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans_features\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans_locales\`;`)
  await db.run(sql`DROP TABLE \`pricing_plans\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`pages_id\` integer,
  	\`services_id\` integer,
  	\`service_nodes_id\` integer,
  	\`legal_documents_id\` integer,
  	\`categories_id\` integer,
  	\`media_id\` integer,
  	\`branches_id\` integer,
  	\`contact_submissions_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`service_nodes_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`legal_documents_id\`) REFERENCES \`legal_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`branches_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "posts_id", "pages_id", "services_id", "service_nodes_id", "legal_documents_id", "categories_id", "media_id", "branches_id", "contact_submissions_id", "users_id") SELECT "id", "order", "parent_id", "path", "posts_id", "pages_id", "services_id", "service_nodes_id", "legal_documents_id", "categories_id", "media_id", "branches_id", "contact_submissions_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_service_nodes_id_idx\` ON \`payload_locked_documents_rels\` (\`service_nodes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_legal_documents_id_idx\` ON \`payload_locked_documents_rels\` (\`legal_documents_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_branches_id_idx\` ON \`payload_locked_documents_rels\` (\`branches_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
}
