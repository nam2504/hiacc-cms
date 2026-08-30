import type { ReactNode } from 'react'
import styles from './Icon.module.css'

/**
 * Bộ icon SVG một màu thay cho emoji (V2 — REVIEW-visual.md §7①).
 *
 * Mọi icon: inline, `currentColor`, `aria-hidden="true"`, không thư viện/CDN.
 * Kích thước theo `font-size` của phần tử cha (`width/height: 1em`) — chỗ gọi
 * tự set `font-size` bằng token sẵn có (`--text-2xl` v.v.), không hex.
 *
 * DANH SÁCH KHOÁ — CHỐT MỘT LẦN cho gói C1 (đổi tên khoá sau khi báo cáo là
 * hỏng việc của C1, xem contract §3):
 *   7 khoá dịch vụ (services.icon, C1 điền vào seed/data.ts):
 *     'chart' | 'folder' | 'search' | 'document' | 'finance' | 'archive' | 'growth'
 *   4 khoá cố định dùng nội bộ (About.tsx, không phụ thuộc C1):
 *     'award' | 'education' | 'legal' | 'phone'
 *   1 khoá cố định (i18n 'news.empty.icon'):
 *     'newspaper'
 *
 * Khoá lạ hoặc rỗng/undefined → fallback an toàn: hình vuông bo góc rỗng,
 * không vỡ layout, không hiện chữ thô.
 */
export type IconKey =
  | 'chart'
  | 'folder'
  | 'search'
  | 'document'
  | 'finance'
  | 'archive'
  | 'growth'
  | 'award'
  | 'education'
  | 'legal'
  | 'phone'
  | 'newspaper'

const PATHS: Record<IconKey, ReactNode> = {
  chart: (
    <>
      <path d="M4 19V10M12 19V5M20 19v-7" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h8l5 5v15H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" />
      <path d="M14 2v5h5" />
    </>
  ),
  finance: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.2c0-1.2 1.1-2.2 2.5-2.2s2.5.9 2.5 2c0 3-5 1.6-5 4.5 0 1.1 1.1 2 2.5 2s2.5-1 2.5-2.2" />
    </>
  ),
  archive: (
    <>
      <path d="M3 7h18v3H3z" />
      <path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
      <path d="M10 14h4" />
    </>
  ),
  growth: (
    <>
      <path d="M4 17l5-5 4 4 7-8" />
      <path d="M15 8h5v5" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5 7 21l5-3 5 3-1.5-8.5" />
    </>
  ),
  education: (
    <>
      <path d="M2 8l10-4 10 4-10 4-10-4Z" />
      <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
    </>
  ),
  legal: (
    <>
      <path d="M12 3v18M7 7l-4 6a3.5 3.5 0 0 0 7 0l-4-6ZM17 7l-4 6a3.5 3.5 0 0 0 7 0l-4-6ZM5 7h14M9 21h6" />
    </>
  ),
  phone: (
    <>
      <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2C10.5 19 5 13.5 5 6a2 2 0 0 1 1-3Z" />
    </>
  ),
  newspaper: (
    <>
      <path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" />
      <path d="M7 9h7M7 12h7M7 15h4" />
      <path d="M19 8v8a2 2 0 0 0 2-2V8h-2Z" />
    </>
  ),
}

/** Fallback an toàn: khung vuông bo góc rỗng, không vỡ layout, không hiện chữ thô. */
function FallbackPath() {
  return <rect x="4" y="4" width="16" height="16" rx="4" />
}

export function Icon({
  name,
  className = '',
}: {
  /** Khoá lạ hoặc rỗng/undefined đều rơi về fallback an toàn. */
  name?: string | null
  className?: string
}) {
  const key = name && name in PATHS ? (name as IconKey) : null

  return (
    <svg
      className={`${styles.icon} ${className}`}
      viewBox="0 0 24 24"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {key ? PATHS[key] : <FallbackPath />}
    </svg>
  )
}
