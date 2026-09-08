import Link from 'next/link'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import type { Setting } from '@/payload-types'
import styles from './QuickQuoteCard.module.css'

/**
 * Hộp "Cần báo phí nhanh?" dưới sidebar trang dịch vụ (Chi tiết dịch vụ.png).
 *
 * Hotline lấy từ Settings, không hardcode — cùng luật với mọi thông tin liên hệ
 * khác trong dự án. Chưa có hotline thì hộp vẫn hiện nhưng chỉ còn nút dẫn sang
 * trang liên hệ, thay vì để hở một link `tel:` rỗng.
 */
export async function QuickQuoteCard({ settings }: { settings: Setting | null }) {
  const locale = await getRequestLocale()
  const tr = createTranslator(locale)
  const hotline = settings?.hotline?.trim() || null

  return (
    <aside className={styles.card}>
      <p className={styles.title}>{tr('service.quickQuote.title')}</p>
      <p className={styles.body}>{tr('service.quickQuote.body')}</p>
      {hotline ? (
        // tel: cần số liền, bỏ khoảng trắng và dấu chấm người nhập cho dễ đọc.
        <a className={styles.phone} href={`tel:${hotline.replace(/[\s.]/g, '')}`}>
          {hotline} <span aria-hidden="true">→</span>
        </a>
      ) : (
        <Link className={styles.phone} href={localizedHref('/lien-he', locale, DEFAULT_LOCALE)}>
          {tr('service.requestQuote')} <span aria-hidden="true">→</span>
        </Link>
      )}
    </aside>
  )
}
