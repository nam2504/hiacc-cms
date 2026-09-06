/**
 * Nhận diện thương hiệu theo TENANT — nguồn sự thật DUY NHẤT.
 *
 * Vì sao có file này: repo phục vụ 2 khách (HiACC và HiTax) trên CÙNG một
 * codebase, mỗi site chạy 1 process + 1 DB riêng (WS-6 T-hitax-host). Dựng site
 * thứ hai = đặt biến môi trường `TENANT`, thay logo trong /admin, nhập nội dung.
 * KHÔNG sửa code.
 *
 * Quy tắc bắt buộc:
 * - Mọi chuỗi thương hiệu và mã màu chỉ được viết ở ĐÂY, không rải trong component.
 * - Giá trị ở đây là *fallback* khi Settings trong DB còn trống. Cái gì khách sửa
 *   được trong /admin thì Settings luôn thắng — xem `resolveBrand()` bên dưới.
 * - Thêm tenant mới = thêm 1 khoá vào TENANTS, không đụng chỗ nào khác.
 */

export type TenantConfig = {
  /** Khoá kỹ thuật: tên file DB, tên app khi deploy. Chỉ [a-z0-9-]. */
  key: string
  /** Tên hiển thị, dùng khi Settings.siteName trống. */
  name: string
  /** Tên pháp nhân đầy đủ, dùng ở footer khi Settings.companyName trống. */
  legalName: string
  slogan: string
  colors: {
    brand: string
    brandDark: string
    brandLight: string
    brandTint: string
    accent: string
    ink: string
  }
  /** Tên site trong thẻ <title> khi Settings.siteName trống. */
  seoSiteName: string
}

const HIACC: TenantConfig = {
  key: 'hiacc',
  name: 'HiACC',
  legalName: 'Công ty TNHH TM & DV HiACC',
  slogan: 'Think Ahead',
  colors: {
    // Đỏ đo từ pixel logo (hiacc-logo.png), xem AUDIT §1. Burgundy #5B0C29 của
    // site tham chiếu bị loại vì lệch khỏi logo, chỉ còn dùng làm màu nhấn.
    brand: '#cc1420',
    brandDark: '#a50f19',
    brandLight: '#e8434e',
    brandTint: '#fdf0f1',
    accent: '#5b0c29',
    ink: '#1f4141',
  },
  seoSiteName: 'Kế toán HiACC',
}

/**
 * HiTax Solutions — dịch vụ kế toán, thuế và pháp lý doanh nghiệp.
 *
 * ⚠️ Giá trị dưới đây là TẠM. Khách chưa gửi logo, chưa chốt tên miền, chưa
 * xác nhận màu (WS-6 T-hitax). Màu đang mượn của HiACC để site dựng được;
 * phải thay khi có bộ nhận diện thật, KHÔNG mang màu này đi báo cáo với khách.
 */
const HITAX: TenantConfig = {
  key: 'hitax',
  name: 'HiTax',
  legalName: 'HiTax Solutions',
  slogan: '',
  colors: { ...HIACC.colors },
  seoSiteName: 'HiTax Solutions',
}

const TENANTS: Record<string, TenantConfig> = {
  hiacc: HIACC,
  hitax: HITAX,
}

function resolveTenant(): TenantConfig {
  const key = process.env.TENANT?.trim().toLowerCase()
  if (!key) return HIACC
  const found = TENANTS[key]
  if (found) return found
  // Sai khoá mà im lặng chạy tiếp thì site lên với thương hiệu của khách KHÁC —
  // hỏng nặng hơn nhiều so với việc không khởi động được.
  throw new Error(
    `TENANT="${key}" không có trong danh sách. Khoá hợp lệ: ${Object.keys(TENANTS).join(', ')}`,
  )
}

export const TENANT: TenantConfig = resolveTenant()

/**
 * Tên thương hiệu để hiển thị: Settings (khách sửa trong /admin) thắng, trống thì
 * rơi về tenant. Mọi component cần tên brand phải đi qua đây, không tự viết chuỗi.
 */
export function brandName(siteName?: string | null): string {
  return siteName?.trim() || TENANT.name
}
