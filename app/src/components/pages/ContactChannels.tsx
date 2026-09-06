import { Container } from '@/components/ui/Container'
import type { Setting } from '@/payload-types'
import styles from './ContactChannels.module.css'

/**
 * Hàng 3 cột đầu trang Liên hệ: điện thoại · email kèm giờ làm việc · kênh khác
 * (thiết kế khách 06/09, `Liên hệ.png` + prototype §A6).
 *
 * Cột nào không có dữ liệu trong Settings thì tự ẩn — không dựng cột rỗng.
 */
export function ContactChannels({ settings }: { settings: Setting | null }) {
  const hotline = settings?.hotline
  const hotline2 = settings?.hotline2
  const email = settings?.email
  const workingHours = settings?.workingHours

  const socials = [
    { href: settings?.facebook, label: 'Facebook' },
    { href: settings?.tiktok, label: 'TikTok' },
    { href: settings?.youtube, label: 'YouTube' },
  ].filter((item): item is { href: string; label: string } => Boolean(item.href))

  if (!hotline && !email && socials.length === 0) return null

  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.row}>
          {hotline || hotline2 ? (
            <div className={styles.col}>
              <h2 className={styles.label}>Điện thoại</h2>
              {hotline ? (
                <a className={styles.value} href={`tel:${hotline.replace(/[^\d+]/g, '')}`}>
                  {hotline}
                </a>
              ) : null}
              {hotline2 ? (
                <a className={styles.value} href={`tel:${hotline2.replace(/[^\d+]/g, '')}`}>
                  {hotline2}
                </a>
              ) : null}
            </div>
          ) : null}

          {email ? (
            <div className={styles.col}>
              <h2 className={styles.label}>Email</h2>
              <a className={styles.value} href={`mailto:${email}`}>
                {email}
              </a>
              {workingHours ? <p className={styles.hint}>Giờ làm việc: {workingHours}</p> : null}
            </div>
          ) : null}

          {socials.length > 0 ? (
            <div className={styles.col}>
              <h2 className={styles.label}>Kênh khác</h2>
              <ul className={styles.links}>
                {socials.map((item) => (
                  <li key={item.label}>
                    <a
                      className={styles.link}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
