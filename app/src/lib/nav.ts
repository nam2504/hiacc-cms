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

/**
 * Menu chính KHÔNG còn khai ở đây: 5 nhóm dịch vụ sinh từ cây trong DB
 * (`src/lib/serviceTree.ts` → `MegaMenu`), vì site thứ hai có cây khác và khách
 * tự thêm nhóm trong /admin. Chỉ các link tĩnh còn nằm trong code.
 */

/** Link trong footer, tách khỏi menu chính để khách sửa độc lập sau này. */
export const FOOTER_NAV: NavItem[] = [
  { labelKey: 'nav.about', label: 'Giới thiệu', href: '/gioi-thieu' },
  { labelKey: 'nav.news', label: 'Tin tức', href: '/tin-tuc' },
  { labelKey: 'nav.contact', label: 'Liên hệ', href: '/lien-he' },
  { labelKey: 'nav.tools.payroll', label: 'Tính lương Gross ↔ Net', href: '/cong-cu/tinh-luong' },
]

/** Đường dẫn không có locale prefix ở giai đoạn 1 (chỉ tiếng Việt). */
export function localizedHref(href: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale) return href
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}
