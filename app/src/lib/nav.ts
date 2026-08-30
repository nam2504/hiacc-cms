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
  // [W5 30/08] Gắn lại mục "Công cụ" sau khi W5 land và route trả 200.
  // Trỏ THẲNG tới /cong-cu/tinh-luong, KHÔNG tạo mục cha trỏ /cong-cu — trang danh
  // sách công cụ đó không tồn tại, trỏ vào là tái lập đúng lỗi REVIEW-ux P0 #4 mà B4 đã vá.
  // Khi có công cụ thứ hai: dựng /cong-cu rồi mới chuyển mục này thành cha + children.
  { labelKey: 'nav.tools.payroll', label: 'Tính lương Gross ↔ Net', href: '/cong-cu/tinh-luong' },
  { labelKey: 'nav.contact', label: 'Liên hệ', href: '/lien-he' },
  { labelKey: 'nav.news', label: 'Tin tức', href: '/tin-tuc' },
]

/** Link trong footer, tách khỏi menu chính để khách sửa độc lập sau này. */
export const FOOTER_NAV: NavItem[] = [
  { labelKey: 'nav.about', label: 'Giới thiệu', href: '/gioi-thieu' },
  { labelKey: 'nav.services', label: 'Dịch vụ chuyên ngành', href: '/dich-vu' },
  { labelKey: 'nav.news', label: 'Tin tức', href: '/tin-tuc' },
  { labelKey: 'nav.contact', label: 'Liên hệ', href: '/lien-he' },
  { labelKey: 'nav.tools.payroll', label: 'Tính lương Gross ↔ Net', href: '/cong-cu/tinh-luong' },
]

/** Đường dẫn không có locale prefix ở giai đoạn 1 (chỉ tiếng Việt). */
export function localizedHref(href: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale) return href
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}
