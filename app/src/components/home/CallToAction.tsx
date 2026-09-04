import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { t } from '@/lib/i18n'
import type { Setting } from '@/payload-types'
import styles from './CallToAction.module.css'

/**
 * Khối CTA cuối trang — đóng finding P0-2 của review bố cục.
 *
 * Trước khối này, toàn bộ trang chủ chỉ có 2 nút và cả hai nằm trong Hero ở
 * y≈509px: 88% chiều dài trang desktop (93% ở mobile) không có điểm hành động
 * nào. Khách đọc hết Services → Branches → Knowledge rồi rơi thẳng vào Footer
 * đúng lúc ý định liên hệ cao nhất.
 *
 * Hotline lấy từ Settings; chưa điền thì chỉ hiện nút — không dựng link `tel:`
 * rỗng.
 */
export function CallToAction({ settings }: { settings: Setting | null }) {
  const hotline = settings?.hotline
  const home = settings?.home

  return (
    <Section
      tone="brand"
      title={home?.ctaTitle || t('home.cta.title')}
      subtitle={home?.ctaSubtitle || t('home.cta.subtitle')}
    >
      <div className={styles.actions}>
        <Button href="/lien-he" variant="invert" size="lg">
          {home?.ctaButton || t('home.cta.button')}
        </Button>
        {hotline && (
          <a className={styles.hotline} href={`tel:${hotline.replace(/[^\d+]/g, '')}`}>
            {t('common.hotline')}: {hotline}
          </a>
        )}
      </div>
    </Section>
  )
}
