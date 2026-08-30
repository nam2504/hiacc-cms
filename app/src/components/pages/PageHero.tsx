import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { mediaAlt, mediaUrl } from '@/lib/site'
import styles from './PageHero.module.css'

/**
 * Đầu trang cho các trang nội dung của W2 (/gioi-thieu, /dich-vu, /lien-he,
 * /dich-vu/<slug>). Tương đương Hero của trang chủ nhưng cho trang con:
 * tiêu đề + mô tả ngắn + ảnh nền tuỳ chọn.
 *
 * `image` chưa upload → nền gradient thương hiệu, không để lỗ trống.
 * `icon` là emoji tự do của services.icon, bỏ trống cũng được.
 */
export function PageHero({
  title,
  subtitle,
  icon,
  image,
}: {
  title: string
  subtitle?: string | null
  icon?: string | null
  /** Giá trị field upload (đã populate hoặc chỉ là id) — mediaUrl tự lo. */
  image?: unknown
}) {
  const url = mediaUrl(image)

  return (
    <header className={styles.hero}>
      {url && (
        <div className={styles.media}>
          <Image
            className={styles.image}
            src={url}
            alt={mediaAlt(image, title)}
            width={1600}
            height={500}
            priority
          />
        </div>
      )}

      <Container>
        <div className={styles.inner}>
          {icon && (
            <span className={styles.icon} aria-hidden="true">
              {icon}
            </span>
          )}
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </Container>
    </header>
  )
}
