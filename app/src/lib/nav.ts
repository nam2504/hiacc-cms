/**
 * Cấu trúc menu chính — INTERFACE dùng chung cho mọi gói W1–W8.
 * Thứ tự giữ nguyên theo AUDIT §2 (site tham chiếu).
 *
 * Nhãn ở đây là nhãn tiếng Việt mặc định; khi bật thêm ngôn ngữ, nhãn lấy qua
 * t() trong src/lib/i18n.ts theo `labelKey`, KHÔNG sửa file này.
 */
export type NavItem = {
  /** Khoá dịch, tra trong src/lib/i18n.ts */
  labelKey: string
  /** Nhãn tiếng Việt mặc định — chỉ dùng khi chưa có bản dịch */
  label: string
  href: string
  children?: NavItem[]
}

export const MAIN_NAV: NavItem[] = [
  { labelKey: 'nav.home', label: 'Trang chủ', href: '/' },
  { labelKey: 'nav.about', label: 'Giới thiệu', href: '/gioi-thieu' },
  { labelKey: 'nav.services', label: 'Dịch vụ chuyên ngành', href: '/dich-vu' },
  // [B4] Mục "Công cụ" (/cong-cu và /cong-cu/tinh-luong) đã GỠ khỏi menu: route
  // chưa tồn tại nên link trả 404 (REVIEW-ux P0 #4). Trang tính lương thuộc gói W5,
  // đang hoãn vì chưa chốt mốc luật thuế. Khoá i18n `nav.tools` / `nav.tools.payroll`
  // trong src/lib/i18n.ts GIỮ NGUYÊN để W5 gắn lại mục này mà không phải dịch lại.
  { labelKey: 'nav.contact', label: 'Liên hệ', href: '/lien-he' },
  { labelKey: 'nav.news', label: 'Tin tức', href: '/tin-tuc' },
]

/** Link trong footer, tách khỏi menu chính để khách sửa độc lập sau này. */
export const FOOTER_NAV: NavItem[] = [
  { labelKey: 'nav.about', label: 'Giới thiệu', href: '/gioi-thieu' },
  { labelKey: 'nav.services', label: 'Dịch vụ chuyên ngành', href: '/dich-vu' },
  { labelKey: 'nav.news', label: 'Tin tức', href: '/tin-tuc' },
  { labelKey: 'nav.contact', label: 'Liên hệ', href: '/lien-he' },
  // [B4] "Tính lương Gross ↔ Net" (/cong-cu/tinh-luong) đã GỠ — cùng lý do như MAIN_NAV ở trên.
]

/** Đường dẫn không có locale prefix ở giai đoạn 1 (chỉ tiếng Việt). */
export function localizedHref(href: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale) return href
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}
