import Link from 'next/link'
import Image from 'next/image'
import { brandName } from '@/config/tenant'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import { mediaAlt, mediaUrl } from '@/lib/site'
import type { Setting } from '@/payload-types'
import styles from './Logo.module.css'

/**
 * Logo lấy từ Settings (upload trong admin). Chưa upload thì hiện tên site dạng
 * chữ — site vẫn dùng được ngay khi mới cài, không vỡ layout.
 *
 * ⚠️ Bản logo hiện có là PNG 300×108; đang chờ khách gửi SVG/AI (WS-6 §Chờ khách).
 */
export async function Logo({
  settings,
  className = '',
  priority = true,
}: {
  settings: Setting | null
  /** Ép thêm class (vd biến thể footer nền tối) mà không tách component riêng. */
  className?: string
  /** Header cần `priority` (LCP); footer thì không — tránh cảnh báo "quá nhiều ảnh priority". */
  priority?: boolean
}) {
  // Logo về trang chủ CÙNG ngôn ngữ: ở /en phải là /en, không phải /.
  const locale = await getRequestLocale()
  const url = mediaUrl(settings?.logo)
  const siteName = brandName(settings?.siteName)

  return (
    <Link
      href={localizedHref('/', locale, DEFAULT_LOCALE)}
      className={`${styles.logo} ${className}`}
      aria-label={siteName}
    >
      {url ? (
        <Image
          src={url}
          alt={mediaAlt(settings?.logo, siteName)}
          width={150}
          height={54}
          priority={priority}
          className={styles.image}
        />
      ) : (
        <span className={styles.text}>{siteName}</span>
      )}
    </Link>
  )
}
