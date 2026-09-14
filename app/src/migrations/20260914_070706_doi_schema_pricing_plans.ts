import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Đảo schema `pricing-plans` (14/09): mỗi document giờ là MỘT DÒNG giá gắn
 * với hạng mục dịch vụ CON cụ thể (`service_node_id`), thay vì một "gói" gắn
 * với nhóm gốc (`service_group_id`, có `features` array). Xem PricingPlans.ts
 * để biết lý do đầy đủ — nguồn giá duy nhất giờ là collection này, không còn
 * nhúng trong `service-nodes.body`.
 *
 * DROP + CREATE lại thay vì ALTER: bảng cũ trên staging chỉ có vài dòng TEST
 * (đã xác nhận ở commit 866288e, khách chưa từng nhập data thật vào đây — data
 * thật nằm trong `body`). Data thật được điền lại bằng `seedPricingRows`
 * (chạy `npm run seed` sau migration), không mất gì.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`pricing_plans_features_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pricing_plans_features\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pricing_plans_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pricing_plans\`;`)

  await db.run(sql`CREATE TABLE \`pricing_plans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`service_node_id\` integer NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`service_node_id\`) REFERENCES \`service_nodes\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pricing_plans_service_node_idx\` ON \`pricing_plans\` (\`service_node_id\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_updated_at_idx\` ON \`pricing_plans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pricing_plans_created_at_idx\` ON \`pricing_plans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`pricing_plans_locales\` (
  	\`item\` text NOT NULL,
  	\`scope\` text,
  	\`fee\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pricing_plans\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pricing_plans_locales_locale_parent_id_unique\` ON \`pricing_plans_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`pricing_plans_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pricing_plans\`;`)

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
}
