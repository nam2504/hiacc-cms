import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Thêm cột `favicon_id` cho global `settings` (field Favicon trong Settings.ts),
 * để khách tự tải icon tab trình duyệt trong admin.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`settings\` ADD \`favicon_id\` integer REFERENCES media(id) ON DELETE set null;`,
  )
  await db.run(sql`CREATE INDEX \`settings_favicon_idx\` ON \`settings\` (\`favicon_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`settings_favicon_idx\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`favicon_id\`;`)
}
