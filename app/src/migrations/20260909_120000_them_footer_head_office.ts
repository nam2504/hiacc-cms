import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Thêm cột cho Settings.footerHeadings.headOffice — tiêu đề cột "Trụ sở" của
 * chân trang 4 cột theo Figma (khách chốt bỏ 2 cột Liên kết nhanh / Bài viết
 * gần đây, 09/09).
 *
 * Localized nên cột nằm ở bảng dịch `settings_locales`, không phải `settings`.
 *
 * Bắt buộc phải có file này: Payload chỉ tự đẩy schema khi
 * NODE_ENV !== 'production'. Thiếu migration thì cột không tồn tại và MỌI truy
 * vấn settings chết 500 (trang public lẫn /admin) trong khi deploy vẫn báo
 * thành công — đã xảy ra thật ở ca5f3a0, vá ở 8631e2c.
 *
 * KHÔNG drop cột quick_links / recent_posts dù giao diện không còn dùng: dữ
 * liệu khách đã nhập vẫn nằm đó, và drop là thao tác không lùi được nếu sau
 * này khách đổi ý muốn bật lại 2 cột.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`footer_headings_head_office\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`footer_headings_head_office\`;`)
}
