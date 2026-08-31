import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { t } from '@/lib/i18n'
import { mediaAlt, mediaUrl } from '@/lib/site'
import type { Setting } from '@/payload-types'
import styles from './Hero.module.css'

/**
 * Khối 2 — AUDIT §3.2: logo/tên site, tagline, nút CTA về /lien-he.
 *
 * Khối rating (điểm sao + số lượng khách hàng) đã gỡ: số chép từ site tham chiếu,
 * không kiểm chứng được. Chỉ dựng lại khi khách cung cấp số thật và chịu trách nhiệm.
 *
 * Logo lấy từ Settings; chưa upload hoặc settings null thì hiện tên site dạng chữ
 * (giống Logo của W0) — trang vẫn dựng được khi DB rỗng.
 */
export function Hero({ settings }: { settings: Setting | null }) {
  const logo = mediaUrl(settings?.logo)
  const siteName = settings?.siteName || 'HiACC'
  // Tagline ưu tiên nội dung khách sửa trong admin, không có thì rơi về khoá dịch.
  const tagline = settings?.tagline || t('home.hero.tagline')

  return (
    <section className={styles.hero}>
      <Container>
        <div className={styles.inner}>
          {logo ? (
            <Image
              className={styles.logo}
              src={logo}
              alt={mediaAlt(settings?.logo, siteName)}
              width={220}
              height={80}
              priority
            />
          ) : (
            <p className={styles.siteName}>{siteName}</p>
          )}

          <h1 className={styles.tagline}>{tagline}</h1>
          <p className={styles.lead}>{t('home.hero.lead')}</p>

          <div className={styles.actions}>
            <Button href="/lien-he" size="lg">
              {t('home.hero.cta')}
            </Button>
            <Button href="/dich-vu" variant="outline" size="lg">
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
