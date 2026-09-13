import Link from 'next/link'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import styles from './Pagination.module.css'

/**
 * Phân trang bằng link thật (?page=N) — server component, không cần state nên
 * không 'use client'. Bot của Google bò được, và bấm Back trên trình duyệt vẫn đúng.
 *
 * `basePath` là đường dẫn không kèm query, ví dụ '/tin-tuc' hoặc
 * '/chuyen-muc/ke-toan-tai-chinh'. Trang 1 không gắn ?page=1 để URL chính tắc
 * chỉ có một dạng (tránh nội dung trùng lặp trên Google).
 *
 * [B2] `basePath` luôn là route KHÔNG có locale prefix — áp `localizedHref`
 * ở đây, chỉ một chỗ, để trang /en/tin-tuc?page=2 không rơi về bản Việt.
 */
function hrefFor(basePath: string, page: number, locale: string) {
  const path = page <= 1 ? basePath : `${basePath}?page=${page}`
  return localizedHref(path, locale, DEFAULT_LOCALE)
}

export async function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <nav className={styles.pagination} aria-label={t('news.pagination.label')}>
      {hasPrev ? (
        <Link className={styles.step} href={hrefFor(basePath, page - 1, locale)} rel="prev">
          {t('news.pagination.prev')}
        </Link>
      ) : (
        <span className={`${styles.step} ${styles.disabled}`} aria-hidden="true">
          {t('news.pagination.prev')}
        </span>
      )}

      <ol className={styles.pages}>
        {pages.map((item) => (
          <li key={item}>
            {item === page ? (
              <span className={`${styles.page} ${styles.current}`} aria-current="page">
                {item}
              </span>
            ) : (
              <Link className={styles.page} href={hrefFor(basePath, item, locale)}>
                {item}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {hasNext ? (
        <Link className={styles.step} href={hrefFor(basePath, page + 1, locale)} rel="next">
          {t('news.pagination.next')}
        </Link>
      ) : (
        <span className={`${styles.step} ${styles.disabled}`} aria-hidden="true">
          {t('news.pagination.next')}
        </span>
      )}
    </nav>
  )
}
