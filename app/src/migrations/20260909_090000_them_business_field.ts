import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Thêm cột cho field Settings.businessField ("Lĩnh vực hoạt động" ở bảng Hồ sơ
 * công ty, trang Giới thiệu).
 *
 * Localized nên cột nằm ở bảng dịch `settings_locales`, không phải `settings`.
 *
 * Bắt buộc phải có file này: Payload chỉ tự đẩy schema khi
 * NODE_ENV !== 'production'. Thiếu migration thì cột không tồn tại và MỌI truy
 * vấn settings chết 500 (trang public lẫn /admin) trong khi deploy vẫn báo
 * thành công — đã xảy ra thật ở ca5f3a0, vá ở 8631e2c.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`business_field\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`business_field\`;`)
}
