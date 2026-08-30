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
import { DEFAULT_PAYROLL_CONFIG, normalizePayrollConfig, type PayrollConfig } from './config'

export async function getPayrollConfig(): Promise<PayrollConfig> {
  try {
    const payload = await getPayloadClient()
    const raw = await payload.findGlobal({ slug: 'payroll-config', depth: 0 })
    return normalizePayrollConfig(raw)
  } catch {
    return DEFAULT_PAYROLL_CONFIG
  }
}
