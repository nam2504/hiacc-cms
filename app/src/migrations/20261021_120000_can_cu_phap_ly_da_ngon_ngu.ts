import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

/**
 * `payroll_config.legal_basis` (Căn cứ pháp lý) thành field localized:
 *   - tạo `payroll_config_locales` (DDL đúng theo schema Payload push ra trên DB trống);
 *   - chép nguyên văn cột cũ sang bản `vi`; chỉ thêm bản `en` (dịch sẵn) cho dòng có bản `vi`
 *     còn đúng chữ mặc định. Dòng đã bị sửa thì không có bản `en` để khỏi lệch nội dung với `vi`,
 *     migration in cảnh báo để người quản trị dịch lại;
 *   - bỏ cột cũ. `down` chép bản `vi` ngược lại cột cũ rồi bỏ bảng locales; mọi chỉnh sửa
 *     bản `en` bị mất.
 * Adapter SQLite không có transaction nên cả `up` lẫn `down` chạy lại được sau khi chết giữa chừng.
 */
const DEFAULT_VI = [
  'Giảm trừ gia cảnh: Nghị quyết 110/2025/UBTVQH15 (áp dụng từ kỳ tính thuế 2026).',
  'Biểu thuế thu nhập cá nhân lũy tiến 5 bậc: Luật Thuế thu nhập cá nhân 2025 (Luật 109/2025/QH15), phần thu nhập từ tiền lương hiệu lực 01/01/2026.',
  'Tỷ lệ bảo hiểm người lao động đóng (BHXH 8%, BHYT 1,5%, BHTN 1%): Luật Bảo hiểm xã hội 2024 (số 41/2024/QH15), Nghị định 158/2025/NĐ-CP, Nghị định 188/2025/NĐ-CP.',
  'Lương tối thiểu vùng: Nghị định 293/2025/NĐ-CP.',
].join('\n')

// DEFAULT của cột gốc (initial migration) có 2 dấu cách đầu mỗi dòng sau dòng đầu.
const DEFAULT_VI_SQL = DEFAULT_VI.replace(/\n/g, '\n  ').replace(/'/g, "''")

const LEGAL_BASIS_EN = [
  'Personal and dependant deductions: Resolution No. 110/2025/UBTVQH15 (applicable from the 2026 tax period).',
  '5-bracket progressive personal income tax schedule: Law on Personal Income Tax 2025 (Law No. 109/2025/QH15); provisions on employment income effective from 1 January 2026.',
  'Employee insurance contribution rates (social insurance 8%, health insurance 1.5%, unemployment insurance 1%): Law on Social Insurance 2024 (No. 41/2024/QH15), Decree No. 158/2025/ND-CP, Decree No. 188/2025/ND-CP.',
  'Regional minimum wages: Decree No. 293/2025/ND-CP.',
].join('\n')

const hasLegacyColumn = async (db: MigrateUpArgs['db']): Promise<boolean> =>
  (await db.all(sql`SELECT 1 AS x FROM pragma_table_info('payroll_config') WHERE name = 'legal_basis'`))
    .length > 0

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`CREATE TABLE IF NOT EXISTS \`payroll_config_locales\` (
	\`legal_basis\` text NOT NULL,
	\`id\` integer PRIMARY KEY NOT NULL,
	\`_locale\` text NOT NULL,
	\`_parent_id\` integer NOT NULL,
	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payroll_config\`(\`id\`) ON UPDATE no action ON DELETE cascade
);`,
  )
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`payroll_config_locales_locale_parent_id_unique\` ON \`payroll_config_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  if (!(await hasLegacyColumn(db))) return
  await db.run(
    sql`INSERT OR IGNORE INTO \`payroll_config_locales\` (\`legal_basis\`, \`_locale\`, \`_parent_id\`) SELECT \`legal_basis\`, 'vi', \`id\` FROM \`payroll_config\`;`,
  )
  await db.run(
    sql`INSERT OR IGNORE INTO \`payroll_config_locales\` (\`legal_basis\`, \`_locale\`, \`_parent_id\`) SELECT ${LEGAL_BASIS_EN}, 'en', \`id\` FROM \`payroll_config\` WHERE \`legal_basis\` = ${DEFAULT_VI};`,
  )
  const edited = await db.all(
    sql`SELECT \`id\` FROM \`payroll_config\` WHERE \`legal_basis\` <> ${DEFAULT_VI}`,
  )
  if (edited.length > 0) {
    console.warn(
      `[migrate] payroll_config: ${edited.length} dòng có Căn cứ pháp lý đã sửa khác mặc định, không ghi sẵn bản en — cần dịch lại trong admin (tab English).`,
    )
  }
  await db.run(sql`ALTER TABLE \`payroll_config\` DROP COLUMN \`legal_basis\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  if (!(await hasLegacyColumn(db))) {
    await db.run(
      sql.raw(
        `ALTER TABLE \`payroll_config\` ADD \`legal_basis\` text DEFAULT '${DEFAULT_VI_SQL}' NOT NULL;`,
      ),
    )
  }
  const localesTable = await db.all(
    sql`SELECT 1 AS x FROM sqlite_master WHERE type = 'table' AND name = 'payroll_config_locales'`,
  )
  if (localesTable.length > 0) {
    await db.run(
      sql`UPDATE \`payroll_config\` SET \`legal_basis\` = COALESCE((SELECT \`legal_basis\` FROM \`payroll_config_locales\` WHERE \`_parent_id\` = \`payroll_config\`.\`id\` AND \`_locale\` = 'vi'), \`legal_basis\`);`,
    )
  }
  await db.run(sql`DROP TABLE IF EXISTS \`payroll_config_locales\`;`)
}
