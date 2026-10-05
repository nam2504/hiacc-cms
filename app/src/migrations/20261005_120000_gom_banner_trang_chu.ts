import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Gom mọi ô của banner trang chủ về nhóm "① Banner đầu trang" (group `home`,
 * tab Trang chủ trong Settings) để khách sửa theo bố cục trang:
 *   - `tagline`       (settings_locales) → `home_hero_tagline`
 *   - `hero_image_id` (settings)         → `home_hero_image_id` (+ đổi tên index)
 *   - thêm `home_hero_blur` (field mới "Độ mờ khung chữ").
 * RENAME COLUMN giữ nguyên dữ liệu đã nhập (slogan VI/EN, ảnh) và tự sửa FK theo.
 * Tên cột/index lấy từ schema Payload push ra trên DB trống, không tự đặt.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` RENAME COLUMN \`tagline\` TO \`home_hero_tagline\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`settings_hero_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`settings\` RENAME COLUMN \`hero_image_id\` TO \`home_hero_image_id\`;`)
  await db.run(
    sql`CREATE INDEX \`settings_home_home_hero_image_idx\` ON \`settings\` (\`home_hero_image_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`settings\` ADD \`home_hero_blur\` numeric;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`home_hero_blur\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`settings_home_home_hero_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`settings\` RENAME COLUMN \`home_hero_image_id\` TO \`hero_image_id\`;`)
  await db.run(sql`CREATE INDEX \`settings_hero_image_idx\` ON \`settings\` (\`hero_image_id\`);`)
  await db.run(sql`ALTER TABLE \`settings_locales\` RENAME COLUMN \`home_hero_tagline\` TO \`tagline\`;`)
}
