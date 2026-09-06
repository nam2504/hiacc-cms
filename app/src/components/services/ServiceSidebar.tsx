import Link from 'next/link'
import { DEFAULT_LOCALE } from '@/lib/locales'
import { localizedHref } from '@/lib/nav'
import { getRequestLocale } from '@/lib/requestLocale'
import type { TreeNode } from '@/lib/serviceTree'
import styles from './ServiceSidebar.module.css'

/**
 * Danh sách hạng mục trong một nhóm, đánh số 01..0n — theo prototype của khách
 * (REQUIREMENTS §A2.2). Mục đang xem được tô nền và viền trái.
 *
 * Server component: danh sách là link thật, không phải tab dựng bằng JS. Nhờ vậy
 * mỗi hạng mục có URL riêng chia sẻ được, và Google đọc được từng trang — thứ
 * mà tab dựng bằng JS không cho.
 */
export async function ServiceSidebar({
  items,
  activePath,
  title,
}: {
  items: TreeNode[]
  activePath: string
  title?: string
}) {
  if (items.length === 0) return null

  // `item.path` trong cây KHÔNG có tiền tố ngôn ngữ — dùng thẳng là bản EN hiện
  // tiêu đề tiếng Anh nhưng link nhảy sang trang tiếng Việt.
  const locale = await getRequestLocale()

  return (
    <nav className={styles.sidebar} aria-label={title || 'Danh sách hạng mục'}>
      <p className={styles.title}>{title || 'Nội dung'}</p>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const active = item.path === activePath
          return (
            <li key={item.id}>
              <Link
                href={localizedHref(item.path, locale, DEFAULT_LOCALE)}
                className={active ? `${styles.item} ${styles.itemActive}` : styles.item}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.label}>{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
