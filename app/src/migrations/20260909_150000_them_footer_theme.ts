import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Thêm 2 cột cho phần màu chân trang (khách yêu cầu 09/09):
 *  - `footer_theme` — chọn tông sáng/tối, mặc định 'light' (đúng Figma).
 *  - `footer_bg`    — mã màu nền tuỳ ý dạng #RRGGBB, bỏ trống thì theo tông trên.
 *
 * Cả hai KHÔNG localized (màu không đổi theo ngôn ngữ) nên nằm ở bảng
 * `settings`, không phải `settings_locales`.
 *
 * Bắt buộc phải có file này: Payload chỉ tự đẩy schema khi
 * NODE_ENV !== 'production'. Thiếu migration thì cột không tồn tại và MỌI truy
 * vấn settings chết 500 (trang public lẫn /admin) trong khi deploy vẫn báo
 * thành công — đã xảy ra thật ở ca5f3a0, vá ở 8631e2c.
 *
 * Không đặt DEFAULT ở tầng DB: bản ghi cũ trả NULL, và `Footer.tsx` đã coi
 * "khác 'dark'" là sáng, nên NULL ra đúng tông sáng mặc định.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` ADD \`footer_theme\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`footer_bg\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`footer_theme\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`footer_bg\`;`)
}
