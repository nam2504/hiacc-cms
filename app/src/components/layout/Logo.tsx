import Link from 'next/link'
import Image from 'next/image'
import { mediaAlt, mediaUrl } from '@/lib/site'
import type { Setting } from '@/payload-types'
import styles from './Logo.module.css'

/**
 * Logo lấy từ Settings (upload trong admin). Chưa upload thì hiện tên site dạng
 * chữ — site vẫn dùng được ngay khi mới cài, không vỡ layout.
 *
 * ⚠️ Bản logo hiện có là PNG 300×108; đang chờ khách gửi SVG/AI (WS-6 §Chờ khách).
 */
export function Logo({ settings }: { settings: Setting | null }) {
  const url = mediaUrl(settings?.logo)
  const siteName = settings?.siteName || 'HiACC'

  return (
    <Link href="/" className={styles.logo} aria-label={siteName}>
      {url ? (
        <Image
          src={url}
          alt={mediaAlt(settings?.logo, siteName)}
          width={150}
          height={54}
          priority
          className={styles.image}
        />
      ) : (
        <span className={styles.text}>{siteName}</span>
      )}
    </Link>
  )
}
