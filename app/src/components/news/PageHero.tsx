import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { createTranslator } from '@/lib/i18n'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import styles from './PageHero.module.css'

export type Crumb = { label: string; href?: string }

/**
 * Đầu trang cho nhánh tin tức / chuyên mục: breadcrumb + tiêu đề + mô tả.
 * Mô tả có thể trống (chuyên mục chưa nhập `description`) → tự ẩn dòng đó.
 *
 * Bỏ `title` khi trang đã có <h1> ở chỗ khác (trang chi tiết bài viết) — mỗi
 * trang chỉ được một <h1>, nếu không thì hỏng cấu trúc heading cho screen reader.
 */
export async function PageHero({
  title,
  description,
  crumbs = [],
}: {
  title?: string
  description?: string | null
  crumbs?: Crumb[]
}) {
  // Breadcrumb giữ ngôn ngữ đang xem — cả link "Trang chủ" lẫn crumb do trang
  // gọi truyền vào (crumb.href là đường dẫn KHÔNG có tiền tố ngôn ngữ).
  const locale = await getRequestLocale()
  const t = createTranslator(locale)
  const href = (path: string) => localizedHref(path, locale, DEFAULT_LOCALE)

  return (
    <header className={styles.hero}>
      <Container>
        <nav className={styles.breadcrumb} aria-label={t('news.breadcrumb.label')}>
          <ol className={styles.crumbs}>
            <li>
              <Link className={styles.crumbLink} href={href('/')}>
                {t('nav.home')}
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={`${crumb.label}-${crumb.href ?? ''}`}>
                {crumb.href ? (
                  <Link className={styles.crumbLink} href={href(crumb.href)}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={styles.crumbCurrent}>{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {title && <h1 className={styles.title}>{title}</h1>}
        {description && <p className={styles.description}>{description}</p>}
      </Container>
    </header>
  )
}
