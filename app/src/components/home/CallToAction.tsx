import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { TENANT } from '@/config/tenant'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './CallToAction.module.css'

/**
 * Dải đỏ CTA cuối trang — theo thiết kế khách 06/09 (`Trang chủ.png`, khối 7):
 * nền đỏ full-width, kicker nhỏ phía trên, tiêu đề lớn căn TRÁI, hai nút.
 *
 * Lý do khối này tồn tại (từ review bố cục trước, vẫn đúng): không có nó thì 88%
 * chiều dài trang desktop không có điểm hành động nào — khách đọc hết rồi rơi
 * thẳng vào footer đúng lúc ý định liên hệ cao nhất.
 *
 * ⚠️ Quyết định V3 (31/08) từng bỏ dải đỏ để chuyển sang nền trắng chữ đỏ. Thiết
 * kế khách gửi 06/09 có lại dải đỏ và user đã chốt theo thiết kế mới.
 */
export function CallToAction({ settings }: { settings: Setting | null }) {
  const home = settings?.home
  const title = home?.ctaTitle || t('home.cta.title')
  const primaryLabel = home?.ctaButton || t('home.cta.button')

  return (
    <section className={styles.cta}>
      <Container>
        <div className={styles.inner}>
          {TENANT.slogan ? <p className={styles.kicker}>{TENANT.slogan}</p> : null}
          <h2 className={styles.title}>{title}</h2>

          <div className={styles.actions}>
            <Link className={styles.primary} href="/lien-he">
              {primaryLabel}
            </Link>
            <Link className={styles.secondary} href="/bang-gia">
              Bảng giá tổng hợp
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
