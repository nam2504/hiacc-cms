import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Thêm 2 cột `salutation`, `field_of_interest` cho `contact_submissions`.
 *
 * Cả hai field đã có trong `ContactSubmissions.ts` (Anh/Chị + Lĩnh vực quan
 * tâm) nhưng thiếu migration đi kèm — dev-push local che mất, deploy lên
 * staging thì form /lien-he chết 100% với lỗi `no column named salutation`
 * (phát hiện 12/09 khi kiểm log staging sau deploy PricingPlans).
 *
 * Bắt buộc phải có file này: Payload chỉ tự đẩy schema khi
 * NODE_ENV !== 'production'. Thiếu migration thì cột không tồn tại và MỌI
 * lượt gửi form liên hệ mất trong khi deploy vẫn báo thành công.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`contact_submissions\` ADD \`salutation\` text;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` ADD \`field_of_interest\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`salutation\`;`)
  await db.run(sql`ALTER TABLE \`contact_submissions\` DROP COLUMN \`field_of_interest\`;`)
}
