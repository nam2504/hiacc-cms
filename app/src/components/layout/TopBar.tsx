import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './TopBar.module.css'

/**
 * Dải trên cùng theo thiết kế khách 06/09: trái là hotline + email, phải là
 * nhóm link phụ. Địa chỉ đã bỏ khỏi đây (nó nằm ở footer và trang Liên hệ) —
 * thiết kế mới không có địa chỉ trên dải này.
 *
 * Mọi giá trị liên hệ lấy từ Settings; thiếu field nào thì ẩn, không hiện rỗng.
 */
const SECONDARY_LINKS = [
  { label: 'Bảng giá', href: '/bang-gia' },
  { label: 'Văn bản pháp luật', href: '/van-ban-phap-luat' },
  { label: 'Bản tin', href: '/tin-tuc' },
  { label: 'Liên hệ', href: '/lien-he' },
]

export function TopBar({ settings }: { settings: Setting | null }) {
  const hotline = settings?.hotline
  const hotline2 = settings?.hotline2
  const email = settings?.email

  return (
    <div className={styles.topbar}>
      <Container>
        <div className={styles.inner}>
          <span className={styles.contacts}>
            {hotline && (
              <a className={styles.item} href={`tel:${hotline.replace(/\s/g, '')}`}>
                {t('common.hotline')} {hotline}
                {hotline2 ? ` / ${hotline2}` : ''}
              </a>
            )}
            {email && (
              <a className={styles.item} href={`mailto:${email}`}>
                {email}
              </a>
            )}
          </span>

          <nav className={styles.links} aria-label="Liên kết phụ">
            {SECONDARY_LINKS.map((link) => (
              <Link key={link.href} className={styles.item} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </div>
  )
}
