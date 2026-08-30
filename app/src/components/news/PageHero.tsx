import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { t } from '@/lib/i18n'
import styles from './PageHero.module.css'

export type Crumb = { label: string; href?: string }

/**
 * Đầu trang cho nhánh tin tức / chuyên mục: breadcrumb + tiêu đề + mô tả.
 * Mô tả có thể trống (chuyên mục chưa nhập `description`) → tự ẩn dòng đó.
 *
 * Bỏ `title` khi trang đã có <h1> ở chỗ khác (trang chi tiết bài viết) — mỗi
 * trang chỉ được một <h1>, nếu không thì hỏng cấu trúc heading cho screen reader.
 */
export function PageHero({
  title,
  description,
  crumbs = [],
}: {
  title?: string
  description?: string | null
  crumbs?: Crumb[]
}) {
  return (
    <header className={styles.hero}>
      <Container>
        <nav className={styles.breadcrumb} aria-label={t('news.breadcrumb.label')}>
          <ol className={styles.crumbs}>
            <li>
              <Link className={styles.crumbLink} href="/">
                {t('nav.home')}
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={`${crumb.label}-${crumb.href ?? ''}`}>
                {crumb.href ? (
                  <Link className={styles.crumbLink} href={crumb.href}>
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
