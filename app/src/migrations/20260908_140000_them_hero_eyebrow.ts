import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Thêm cột cho field Settings.home.heroEyebrow (dòng chữ nhỏ trên slogan hero).
 *
 * Field khai `localized: true` nên cột nằm ở bảng dịch `settings_locales`,
 * KHÔNG phải `settings` — mỗi ngôn ngữ một dòng ở bảng đó.
 *
 * Vì sao cần file này: Payload chỉ tự đẩy schema khi NODE_ENV !== 'production'.
 * Image chạy production, nên thêm field mà không có migration thì cột không tồn
 * tại, và MỌI truy vấn settings chết với "no such column: home_hero_eyebrow" —
 * trang public lẫn /admin cùng trả 500, trong khi deploy vẫn báo thành công.
 * Đã xảy ra thật ở ca5f3a0.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`home_hero_eyebrow\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`home_hero_eyebrow\`;`)
}
