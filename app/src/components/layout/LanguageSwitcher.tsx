'use client'

import { enabledLocaleObjects, ALL_LOCALES } from '@/lib/locales'
import { t } from '@/lib/i18n'
import styles from './LanguageSwitcher.module.css'

/**
 * Chọn ngôn ngữ. Giai đoạn 1 chỉ có 'vi' nên component tự ẩn — bật thêm ngôn ngữ
 * trong src/lib/locales.ts là nó hiện ra, KHÔNG phải sửa file này (cam kết i18n
 * với khách 30/08).
 *
 * Site cũ có switcher 4 cờ nhưng là vỏ (link '#', AUDIT §2). Ở đây khi bật thật
 * thì href phải trỏ route có locale prefix.
 */
export function LanguageSwitcher({ current }: { current: string }) {
  if (enabledLocaleObjects.length < 2) return null

  return (
    <nav className={styles.wrap} aria-label={t('nav.language')}>
      {ALL_LOCALES.filter((l) => enabledLocaleObjects.some((e) => e.code === l.code)).map(
        (locale) => (
          <a
            key={locale.code}
            href={locale.code === 'vi' ? '/' : `/${locale.code}`}
            className={`${styles.item} ${locale.code === current ? styles.active : ''}`}
            aria-current={locale.code === current ? 'true' : undefined}
            lang={locale.code}
          >
            <span aria-hidden="true">{locale.flag}</span>
            <span className={styles.label}>{locale.label}</span>
          </a>
        ),
      )}
    </nav>
  )
}
