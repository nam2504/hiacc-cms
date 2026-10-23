/**
 * Đọc số liệu luật từ global `payroll-config` (contract W5 §2.6).
 *
 * Vì sao không nằm trong src/lib/site.ts: site.ts là file của W0, gói W5 chỉ được ĐỌC
 * (contract §5). Helper riêng đặt trong thư mục W5 sở hữu.
 *
 * Global lỗi / chưa seed / DB sập → trả DEFAULT_PAYROLL_CONFIG, trang vẫn chạy,
 * không trắng (contract §2.6 "Luồng dữ liệu").
 *
 * ⚠️ Chỉ dùng ở SERVER component. Đây là chiều đọc cấu hình xuống client — KHÔNG
 * có chiều ngược lại: lương người dùng nhập không bao giờ rời trình duyệt.
 */
import { getPayloadClient } from '@/lib/site'
import {
  DEFAULT_PAYROLL_CONFIG,
  DEFAULT_PAYROLL_CONFIG_EN,
  normalizePayrollConfig, type PayrollConfig } from './config'

export async function getPayrollConfig(locale: string = 'vi'): Promise<PayrollConfig> {
  try {
    const payload = await getPayloadClient()
    const raw = await payload.findGlobal({
      slug: 'payroll-config',
      depth: 0,
      locale: locale === 'en' ? 'en' : 'vi',
      // Tắt fallback sang vi: thiếu bản en thì defaultValue theo locale chạy, giống tab English
      // trong admin; để fallback thì /en hiện căn cứ tiếng Việt.
      fallbackLocale: false,
    })
    return normalizePayrollConfig(raw, locale)
  } catch {
    return locale === 'en' ? DEFAULT_PAYROLL_CONFIG_EN : DEFAULT_PAYROLL_CONFIG
  }
}
