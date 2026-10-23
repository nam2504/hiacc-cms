/**
 * Seed global `payroll-config` (gói W5, contract §2.6).
 *
 * IDEMPOTENT theo đúng kiểu seed đang có: chỉ điền field còn TRỐNG, KHÔNG đè giá trị
 * khách đã sửa trong /admin. Chạy `npm run seed` lại nhiều lần an toàn — nếu kế toán
 * đã cập nhật giảm trừ gia cảnh mới, seed không được kéo về số cũ.
 *
 * ⚠️ NGUỒN SỐ: DEFAULT_PAYROLL_CONFIG trong src/lib/payroll/config.ts, chép từ contract
 * W5 §2 do PM cấp. Seed KHÔNG tự khai lại số ở đây để hai chỗ không lệch nhau.
 */
import { sql } from '@payloadcms/db-sqlite'
import type { Payload } from 'payload'
import { DEFAULT_PAYROLL_CONFIG, DEFAULT_PAYROLL_CONFIG_EN } from '../lib/payroll/config'

/** Field coi như "khách đã nhập" → không đụng. Mảng rỗng tính là chưa nhập. */
const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  return true
}

export async function seedPayrollConfig(payload: Payload): Promise<number> {
  // Ép qua `unknown`: kiểu sinh ra cho global không có index signature, mà seed chỉ
  // cần đọc theo tên field dạng chuỗi để biết ô nào còn trống.
  const current = (await payload.findGlobal({ slug: 'payroll-config' })) as unknown as Record<
    string,
    unknown
  >

  const defaults: Record<string, unknown> = {
    personalDeduction: DEFAULT_PAYROLL_CONFIG.personalDeduction,
    dependentDeduction: DEFAULT_PAYROLL_CONFIG.dependentDeduction,
    taxBrackets: DEFAULT_PAYROLL_CONFIG.taxBrackets,
    insuranceRates: DEFAULT_PAYROLL_CONFIG.insuranceRates,
    insuranceCap: DEFAULT_PAYROLL_CONFIG.insuranceCap,
    regions: DEFAULT_PAYROLL_CONFIG.regions,
    unemploymentCapMultiplier: DEFAULT_PAYROLL_CONFIG.unemploymentCapMultiplier,
    effectiveFrom: DEFAULT_PAYROLL_CONFIG.effectiveFrom,
  }

  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(defaults)) {
    if (!hasValue(current?.[key])) patch[key] = value
  }

  let written = 0
  if (Object.keys(patch).length > 0) {
    await payload.updateGlobal({ slug: 'payroll-config', data: patch })
    written += Object.keys(patch).length
  }

  // Căn cứ pháp lý là field localized có defaultValue theo locale nên đọc qua findGlobal luôn ra
  // giá trị; muốn biết bản nào thật sự đã lưu thì hỏi thẳng bảng locales.
  const drizzle = (payload.db as unknown as { drizzle: { all: (q: unknown) => Promise<unknown[]> } })
    .drizzle
  const stored = (await drizzle.all(
    sql`SELECT \`_locale\` AS locale FROM \`payroll_config_locales\``,
  )) as { locale: string }[]
  const have = new Set(stored.map((r) => r.locale))
  if (!have.has('vi')) {
    await payload.updateGlobal({
      slug: 'payroll-config',
      locale: 'vi',
      data: { legalBasis: DEFAULT_PAYROLL_CONFIG.legalBasis },
    })
    written += 1
  }
  if (!have.has('en')) {
    await payload.updateGlobal({
      slug: 'payroll-config',
      locale: 'en',
      data: { legalBasis: DEFAULT_PAYROLL_CONFIG_EN.legalBasis },
    })
    written += 1
  }
  return written
}
