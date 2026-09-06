import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Setting } from '@/payload-types'
import styles from './TopBar.module.css'

/**
 * Dải trên cùng theo thiết kế khách 06/09: trái là hotline + email, phải là
 * nhóm link phụ. Địa chỉ đã bỏ khỏi đây (nó nằm ở footer và trang Liên hệ) —
 * thiết kế mới không có địa chỉ trên dải này.
 *
 * Mọi giá trị liên hệ lấy từ Settings; thiếu field nào thì ẩn, không hiện rỗng.
 */
/** Nhãn giữ dạng KHOÁ, dịch lúc render — hằng số ở tầng module không biết
    người đang xem dùng ngôn ngữ nào. */
const SECONDARY_LINKS = [
  { labelKey: 'nav.pricing', href: '/bang-gia' },
  { labelKey: 'nav.legalDocs', href: '/van-ban-phap-luat' },
  { labelKey: 'nav.newsletter', href: '/tin-tuc' },
  { labelKey: 'nav.contact', href: '/lien-he' },
] as const

export async function TopBar({ settings }: { settings: Setting | null }) {
  // Nhóm link phụ phải giữ ngôn ngữ đang xem; tel:/mailto: thì không bọc.
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
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
                {tr('common.hotline')} {hotline}
                {hotline2 ? ` / ${hotline2}` : ''}
              </a>
            )}
            {email && (
              <a className={styles.item} href={`mailto:${email}`}>
                {email}
              </a>
            )}
          </span>

          <nav className={styles.links} aria-label={tr('nav.secondaryLinks')}>
            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.href}
                className={styles.item}
                href={localizedHref(link.href, locale, DEFAULT_LOCALE)}
              >
                {tr(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </div>
  )
}
