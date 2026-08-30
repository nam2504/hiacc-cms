import { Container } from '@/components/ui/Container'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './TopBar.module.css'

/**
 * Dải trên cùng: địa chỉ + 2 hotline + email (AUDIT §3.1).
 * Mọi giá trị lấy từ Settings — thiếu field nào thì ẩn dòng đó, không hiện chuỗi rỗng.
 */
export function TopBar({ settings }: { settings: Setting | null }) {
  const address = settings?.headOfficeAddress
  const hotline = settings?.hotline
  const hotline2 = settings?.hotline2
  const email = settings?.email

  if (!address && !hotline && !email) return null

  return (
    <div className={styles.topbar}>
      <Container>
        <div className={styles.inner}>
          {address && (
            <span className={styles.item}>
              <span className={styles.label}>{t('common.address')}:</span> {address}
            </span>
          )}
          <span className={styles.contacts}>
            {hotline && (
              <a className={styles.item} href={`tel:${hotline.replace(/\s/g, '')}`}>
                {t('common.hotline')}: {hotline}
              </a>
            )}
            {hotline2 && (
              <a className={styles.item} href={`tel:${hotline2.replace(/\s/g, '')}`}>
                {hotline2}
              </a>
            )}
            {email && (
              <a className={styles.item} href={`mailto:${email}`}>
                {email}
              </a>
            )}
          </span>
        </div>
      </Container>
    </div>
  )
}
